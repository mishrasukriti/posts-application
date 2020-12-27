const mongodb = require("mongodb")
const cors = require("cors")
const express = require("express");
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

const {validateUser, checkRole} = require("./auth")

const mongoClient = mongodb.MongoClient
const objectId = mongodb.ObjectID
const ISODate = mongodb.ISODate
const app = express();
let port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`The app is running on port: ${port}`));
app.use(express.json());
app.use(cors())
dotenv.config()

const url = process.env.DB_URL || 'mongodb://localhost:27017';
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: process.env.email,
         pass: process.env.password
     }
 });

 const mailOptions = {
  from: process.env.email, 
  to: '', 
  subject: 'Password reset', 
  html: ''
};

let sampleMail = '<p>Hi, </p>'
                 +'<p>Please click on this link to reset password</p>'
                 +'<a target="blank" href="urlToBeReplaced">urlToBeReplaced</a>'
                 +'<p>Regards</p>'
let activateMail = '<p>Hi, </p>'
                 +'<p>Please click on this link to activate your account</p>'
                 +'<a target="blank" href="urlToBeReplaced">urlToBeReplaced</a>'
                 +'<p>Regards</p>'
                 

app.put("/reset-password", async(req, res)=>{
  try{
    let client = await mongodb.connect(url);
    let db = client.db("topic_db");
    let data = await db.collection("users").findOne({ email: req.body.email });
    let salt = await bcrypt.genSalt(8);
    if (data) {
      let randomStringData = {randomString : salt}
      await db.collection("users").findOneAndUpdate({email: req.body.email}, {$set :randomStringData})
      mailOptions.to = req.body.email
      let resetURL = process.env.resetURL
      resetURL = resetURL+"?id="+data._id+"&rs="+salt
      let resultMail = sampleMail
      resultMail = resultMail.replace("urlToBeReplaced", resetURL)
      resultMail = resultMail.replace("urlToBeReplaced", resetURL)
      mailOptions.html = resultMail
      await transporter.sendMail(mailOptions)
      res.status(200).json({
        message: "Verification mail sent"
      });
      } else {
        res.status(400).json({
          message: "User is not registered"
        });
      }
    client.close();
  }
  catch(error){
    res.status(500).json({
        message: "Internal Server Error"
    })
}

})

app.put("/change-password/:id", async(req, res)=>{
    try{
        let client = await mongoClient.connect(url)
        let db = client.db("topic_db")
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        let result = await db.collection("users").findOneAndUpdate({_id: objectId(req.params.id)}, {$set :req.body})
        res.status(200).json({
            message : "Password Changed Successfully"
        })
        client.close()
    }
    catch(error){
        res.status(500).json({
            message: "Error while changing the password"
        })
    }
})


app.post("/register", async (req, res) => {
    try {
      let client = await mongodb.connect(url);
      let db = client.db("topic_db");
      let data = await db.collection("users").findOne({ email: req.body.email });
      if (data) {
        res.status(400).json({
          message: "User already exists",
        });
      } else {
        let randomString = await bcrypt.genSalt(8);
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        let reqData = req.body
        reqData["activateString"] = randomString
        let result = await db.collection("users").insertOne(reqData);
        data = await db.collection("users").findOne({ email: req.body.email });
        mailOptions.to = req.body.email
        mailOptions.subject = "Account activation mail"
        let activateURL = process.env.activateURL
        activateURL = activateURL+"?id="+data._id+"&ac="+randomString
        let resultMail = activateMail
        resultMail = resultMail.replace("urlToBeReplaced", activateURL)
        resultMail = resultMail.replace("urlToBeReplaced", activateURL)
        mailOptions.html = resultMail
        await transporter.sendMail(mailOptions)
        res.status(200).json({
          message: "Activation mail sent",
        });
      }
      client.close();
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  });
  
  app.post("/login", async (req, res) => {
    try {
      let client = await mongodb.connect(url);
      let db = client.db("topic_db");
      let data = await db.collection("users").findOne({ email: req.body.email });
      if (data) {
        let isValid = await bcrypt.compare(req.body.password, data.password);
        if (isValid) {
          if(data.isActivated === "true"){
            let token = await jwt.sign(
              {userMail:data.email, role:data.role}, 
              process.env.SECRET_KEY,
              {
                expiresIn: "1h"
              })
              res.status(200).json({ message: "Login success", token });
          }
          else{
            res.status(401).json({ message: "Account not activated" });
          }
          
        } else {
          res.status(401).json({ message: "Incorrect password" });
        }
      } else {
        res.status(400).json({
          message: "User is not registered",
        });
      }
      client.close();
    } catch (error) {
      res.status(500).json({
          message: "Internal Server Error"
      });
    }
  });


  app.post("/password-reset", async (req, res) => {
    try {
      let client = await mongodb.connect(url);
      let db = client.db("topic_db");
      let data = await db.collection("users").findOne({ _id: objectId(req.body.objectId) });
      if (data.randomString === req.body.randomString) {
        res.status(200).json({ message: "Verification success" });
      } else {
        res.status(401).json({
          message: "You are not authorized",
        });
      }
      client.close();
    } catch (error) {
      res.status(500).json({
          message: "Internal Server Error"
      });
    }
  });

  app.post("/activate_account", async (req, res) => {
    try {
      let client = await mongodb.connect(url);
      let db = client.db("topic_db");
      let data = await db.collection("users").findOne({ _id: objectId(req.body.objectId) });
      if (data.activateString === req.body.randomString) {
        let activation = {isActivated : "true"}
        await db.collection("users").findOneAndUpdate({_id: objectId(req.body.objectId)}, {$set :activation})
        res.status(200).json({ message: "Verification success" });
      } else {
        res.status(401).json({
          message: "You are not authorized",
        });
      }
      client.close();
    } catch (error) {
      res.status(500).json({
          message: "Internal Server Error"
      });
    }
  });

app.get("/get_posts",async(req, res)=>{
    try{
        let client = await mongoClient.connect(url)
        let db = client.db("topic_db")
        let result = await db.collection("posts").aggregate([
          { 
            $addFields: { "_id": { "$toString": "$_id" } }
          },
          {
            
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'postId',
              as: 'comments'
            }
          }
        ]).toArray();
        res.status(200).json({
            data : result,
            message : "Updated posts fetched"
        })
        client.close()
    }
    catch(error){
        res.status(500).json({
            message:"Error while fetching [posts]"
        })
    }

})

app.post("/add-post", validateUser,async(req, res)=>{
  try{
      let client = await mongoClient.connect(url)
      let db = client.db("topic_db")
      let reqBody = req.body
      reqBody["addedBy"] = req.user
      let result = await db.collection("posts").insertOne(reqBody)
      res.status(200).json({
          message :"Post record inserted"
      })
      client.close()
  }
  catch(error){
      res.status(500).json({
          message: "Error while adding the post"
      })
  }
})

app.post("/add-comment", validateUser,async(req, res)=>{
  try{
      let client = await mongoClient.connect(url)
      let db = client.db("topic_db")
      let reqBody = req.body
      reqBody["addedBy"] = req.user
      let result = await db.collection("comments").insertOne(reqBody)
      res.status(200).json({
          message :"Comment inserted"
      })
      client.close()
  }
  catch(error){
      res.status(500).json({
          message: "Error while adding the comment"
      })
  }
})


app.put("/edit-post/:id", [validateUser, checkRole("admin")], async(req, res)=>{
  try{
      let client = await mongoClient.connect(url)
      let db = client.db("topic_db")
      let result = await db.collection("posts").findOneAndUpdate({_id: objectId(req.params.id)}, {$set :req.body})
      res.status(200).json({
          message : "Post edited"
      })
      client.close()
  }
  catch(error){
      res.status(500).json({
          message: "Error while editing the post"
      })
  }
})


app.put("/edit-comment/:id", [validateUser, checkRole("admin")], async(req, res)=>{
  try{
      let client = await mongoClient.connect(url)
      let db = client.db("topic_db")
      let result = await db.collection("comments").findOneAndUpdate({_id: objectId(req.params.id)}, {$set :req.body})
      res.status(200).json({
          message : "Comment edited"
      })
      client.close()
  }
  catch(error){
      res.status(500).json({
          message: "Error while editing the comment"
      })
  }
})


app.delete("/delete-post/:id", [validateUser, checkRole("admin")], async(req, res)=>{
  try{
  let client = await mongoClient.connect(url)
  let db = client.db("topic_db")
  let result = await db.collection("posts").deleteOne({_id: objectId(req.params.id)})
  res.status(200).json({
      message: "Post deleted"
  })
  client.close()

  }
  catch(error){
      res.status(500).json({
          message : "Internal server error"
      })
  }
})

app.delete("/delete-comment/:id", [validateUser, checkRole("admin")], async(req, res)=>{
  try{
  let client = await mongoClient.connect(url)
  let db = client.db("topic_db")
  let result = await db.collection("comments").deleteOne({_id: objectId(req.params.id)})
  res.status(200).json({
      message: "Comment deleted"
  })
  client.close()

  }
  catch(error){
      res.status(500).json({
          message : "Internal server error"
      })
  }
})





