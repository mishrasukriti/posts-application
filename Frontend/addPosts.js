let url = "http://localhost:3000"
let jwt_token = sessionStorage.getItem("JWT_Token")
document.getElementById('savePostFormId').addEventListener('submit', function(e) {
    e.preventDefault(); //to prevent form submission
    onSave();
  });

function onSave(){
    let title = document.getElementById("saveTitleId").value 
    let description = document.getElementById("saveDescId").value 
    // let imagePath = document.getElementById("saveImgPathId").value
    let addedDate = Date.now()
    fetch(url + `/add-post`, {
        method: "POST",
        body: JSON.stringify({
            title, description, addedDate
        }),
        headers: {
            'Content-type': 'application/json',
            Authorization : jwt_token
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            if (data.message === 'Post record inserted'){
                document.getElementById("redirectIndexId").click()
            }
            else{
                let colDiv2 = document.getElementById("alertDiv")
                let alertDiv = document.createElement("div")
                alertDiv.setAttribute("role", "alert")
                alertDiv.setAttribute("style", "margin-top: 10px")
                alertDiv.setAttribute("id", "addPostFailure")
                alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
                alertDiv.innerHTML = "<strong>Failure!</strong> " + data.message
                colDiv2.appendChild(alertDiv)
                deleteAlert("addPostFailure")

            }
        })
        .catch((err)=>{
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 10px")
            alertDiv.setAttribute("id", "addPostFailure")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("addPostFailure")
        })

    
}

function onCancel(){
    document.getElementById("redirectIndexId").click()
}

function onImagePathChange(){
    let imagePath = document.getElementById("saveImgPathId").value
    let imageTag = document.getElementById("saveImageId")
    imageTag.setAttribute("src", imagePath)

}

function deleteAlert(elementId){
    setTimeout(function(){
        let node = document.getElementById(elementId)
        node.remove()
    }, 3000)
}