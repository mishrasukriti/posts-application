let url = "https://sukriti-posts-application.herokuapp.com"

let jwt_token = sessionStorage.getItem("JWT_Token")
let date_dict = {
    "all" : "allTimeId",
    "day": "dayId",
    "week": "weekId",
    "month": "monthId"
}

let date_number = {
    "all" : "allTimeId",
    "day": 1,
    "week": 7,
    "month": 30
}

let rows_dict = {
    1 : "row1Id",
    2: "row2Id",
    3: "row3Id",
    4: "row4Id",
    5: "row5Id"
}

let currentDate = "all"
let currentRows = 1


let posts = []

let state = {
    'dataset' : posts,
    'page' : 1,
    'rows' : 1
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function getPosts(){
    fetch(url + `/get_posts`, {
        headers:{
            Authorization : sessionStorage.getItem("JWT_Token")
        }
    })
    .then((resp) => {
        return resp.json()
    })
    .then((response) => {
        if (response.message == "Updated posts fetched"){
            posts = response.data
            state.dataset = posts
            createPosts()
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-success myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "getPostsSuccessId")
            alertDiv.innerHTML = "<strong>Success!</strong> "+response.message
            colDiv2.appendChild(alertDiv)
            deleteAlert("getPostsSuccessId")
        } 
        else{
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "getPostsFailureId")
            alertDiv.innerHTML = "<strong>Failure!</strong> " + response.message
            colDiv2.appendChild(alertDiv)
            deleteAlert("getPostsFailureId")

        }
    })
    .catch((err)=>{
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "getPostsFailureId")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("getPostsFailureId")
        
    })
}
getPosts()

function createPosts(){
    let mainDiv = document.getElementById("mainDiv")
    removeAllChildNodes(mainDiv)
    let heading = document.createElement("h2")
    heading.innerHTML = "Latest Posts"
    mainDiv.appendChild(heading)
    let data = pagination(state.dataset, state.page, state.rows)
    let currentData = data.dataset
    for (let i=0; i<currentData.length; i++){
        let secondDiv = document.createElement("div")
        secondDiv.setAttribute("style", "margin-top: 20px;")
        secondDiv.setAttribute("id", "secondDiv"+currentData[i]._id)
        mainDiv.appendChild(secondDiv)
        let title = document.createElement("p")
        title.setAttribute("class", "text-justify")
        title.innerHTML = '<h5>Title</h5><p>' + currentData[i].title + '</p>';
        secondDiv.appendChild(title)

        let desc = document.createElement("p")
        desc.setAttribute("class", "text-justify pt-2")
        desc.innerHTML = '<h5>Description</h5><p>' + currentData[i].description + '</p>';
        secondDiv.appendChild(desc)

        // let image = document.createElement("img")
        // image.setAttribute("class", "img-fluid")
        // image.setAttribute("src", currentData[i].imagePath)
        // secondDiv.appendChild(image)

        let added = document.createElement("p")
        added.innerText = currentData[i].addedBy
        added.setAttribute("id", "added"+currentData[i]._id)
        secondDiv.appendChild(added)
        
        let date = document.createElement("p")
        date.classList.add('pt-2')
        date.innerHTML = '<h5>Created On</h5><p>' + new Date(currentData[i].addedDate) + '</p>';
        secondDiv.appendChild(date)

        let edit = document.createElement("button")
        edit.setAttribute("class", "btn btn-dark mt-2")
        edit.setAttribute("style", "margin-right: 5px;")
        edit.setAttribute("value", currentData[i]._id)
        edit.setAttribute("onclick", "onEdit(value)")
        edit.innerText = "Edit"
        secondDiv.appendChild(edit)

        let deleteButton = document.createElement("button")
        deleteButton.setAttribute("class", "btn btn-danger mt-2")
        deleteButton.setAttribute("style", "margin-right: 5px;")
        deleteButton.setAttribute("value", currentData[i]._id)
        deleteButton.setAttribute("onclick", "onDelete(value)")
        deleteButton.innerText = "Delete"
        secondDiv.appendChild(deleteButton)

        let comment = document.createElement("button")
        comment.setAttribute("class", "btn btn-primary mt-2")
        comment.setAttribute("value", currentData[i]._id)
        comment.setAttribute("onclick", "onComment(value)")
        comment.setAttribute("style", "margin-right: 5px;")
        comment.innerText = "Comment"
        secondDiv.appendChild(comment)

        let commentDiv = document.createElement("div")
        commentDiv.setAttribute("id", "comment"+currentData[i]._id)
        commentDiv.setAttribute("style", "margin-top: 15px;")
        secondDiv.appendChild(commentDiv)
        if (currentData[i].comments.length > 0){
            let commentHeading = document.createElement("h5")
            commentHeading.innerHTML = "Comments"
            commentDiv.appendChild(commentHeading)
        }
        
        for (let j=0; j<currentData[i].comments.length; j++){
            let midDiv = document.createElement("div")
            midDiv.setAttribute("style", "margin-top:10px")
            commentDiv.appendChild(midDiv)
            let commentText = document.createElement("input")
            commentText.value = currentData[i].comments[j].comment
            commentText.setAttribute("id", "comment"+currentData[i].comments[j]._id)
            commentText.setAttribute("style", "padding:6px 6px")
            commentText.disabled = true
            midDiv.appendChild(commentText)
            let editComment = document.createElement("button")
            editComment.setAttribute("class", "btn btn-dark")
            editComment.setAttribute("id", "edit"+currentData[i].comments[j]._id)
            editComment.setAttribute("style", "margin-left:10px;margin-right: 5px;")
            editComment.setAttribute("value", currentData[i].comments[j]._id)
            editComment.setAttribute("onclick", "onEditComment(value)")
            editComment.innerText = "Edit"
            midDiv.appendChild(editComment)

            let emailInput = document.createElement("input")
            emailInput.setAttribute("id", "email"+currentData[i].comments[j]._id)
            emailInput.setAttribute("value", currentData[i].comments[j].addedBy)
            emailInput.setAttribute("class", "d-none")
            midDiv.appendChild(emailInput)

            let deleteCommentButton = document.createElement("button")
            deleteCommentButton.setAttribute("class", "btn btn-danger")
            deleteCommentButton.setAttribute("id", "delete"+currentData[i].comments[j]._id)
            deleteCommentButton.setAttribute("style", "margin-right: 5px;")
            deleteCommentButton.setAttribute("value", currentData[i].comments[j]._id)
            deleteCommentButton.setAttribute("onclick", "onDeleteComment(value)")
            deleteCommentButton.innerText = "Delete"
            midDiv.appendChild(deleteCommentButton)
        }



    }
    if (state.dataset.length > 0){
        buildNavBar()
    }
    

}

function deleteAlert(elementId){
    setTimeout(function(){
        let node = document.getElementById(elementId)
        node.remove()
    }, 3000)
}

function onEditComment(value){
    let commentInput = document.getElementById("comment"+value)
    commentInput.disabled = false

    let editButton = document.getElementById("edit"+value)
    editButton.setAttribute("class", "btn btn-success")
    editButton.setAttribute("onclick", "onSaveEditComment(value)")
    editButton.innerText = "Save"

    let deleteButton = document.getElementById("delete"+value)
    deleteButton.innerHTML = "Cancel"
    deleteButton.setAttribute("onclick", "onEditCancel(value)")
    

}

function onEditCancel(value){
    let commentInput = document.getElementById("comment"+value)
    commentInput.disabled = true

    let editButton = document.getElementById("edit"+value)
    editButton.setAttribute("class", "btn btn-dark")
    editButton.setAttribute("onclick", "onEditComment(value)")
    editButton.innerText = "Edit"

    let deleteButton = document.getElementById("delete"+value)
    deleteButton.innerHTML = "Delete"
    deleteButton.setAttribute("onclick", "onDeleteComment(value)")
}

function onSaveEditComment(id){
    let comment = document.getElementById("comment"+id).value
    let mail = document.getElementById("email"+id).value
    fetch(url + `/edit-comment/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            comment, mail
        }),
        headers: {
            'Content-type': 'application/json',
            Authorization: jwt_token
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            if (data.message === "Comment edited"){
                getPosts()
            }
            else{
                let colDiv2 = document.getElementById("alertDiv")
                let alertDiv = document.createElement("div")
                alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
                alertDiv.setAttribute("role", "alert")
                alertDiv.setAttribute("style", "margin-top: 15px")
                alertDiv.setAttribute("id", "editPostFailure")
                alertDiv.innerHTML = "<strong>Failure!</strong> " + data.message
                colDiv2.appendChild(alertDiv)
                deleteAlert("editPostFailure")
        
            }
        })
        .catch((err)=>{
            let colDiv2 = document.getElementById("alerDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "editPostFailure")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("editPostFailure")
        })

}

function onDeleteComment(id){
    let mail= document.getElementById("email"+id).value
    fetch(url + `/delete-comment/${id}`, {
        method: "DELETE",
        body: JSON.stringify({
            mail
        }),
        headers: {
            'Content-type': 'application/json', 
            Authorization: jwt_token
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            if(data.message === "Comment deleted"){
                getPosts()
            }
            else{
                let colDiv2 = document.getElementById("alertDiv")
                let alertDiv = document.createElement("div")
                alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
                alertDiv.setAttribute("role", "alert")
                alertDiv.setAttribute("style", "margin-top: 15px")
                alertDiv.setAttribute("id", "deleteCommentFailure")
                alertDiv.innerHTML = "<strong>Failure!</strong> " + data.message
                colDiv2.appendChild(alertDiv)
                deleteAlert("deleteCommentFailure")
            }
        })
        .catch((err)=>{
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "deleteCommentFailure")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("deleteCommentFailure")
        })

}

function onEdit(id){
    let post = posts.filter((data)=>{
        return data._id == id
    })[0]
    let saveButton = document.getElementById("editSaveBtnId")
    saveButton.setAttribute("value", id)
    document.getElementById("editTitleId").value = post.title
    document.getElementById("editDescId").value = post.description
    document.getElementById("editImgPathId").value = post.imagePath 
    let imageTag = document.getElementById("editImageId")
    imageTag.setAttribute("src", post.imagePath)
    let editDiv = document.getElementById("editPostDiv")
    let postListDiv = document.getElementById("postListDiv")
    editDiv.setAttribute("class", "row")
    postListDiv.setAttribute("class", "d-none")
}

function onDelete(id){
    let mail = document.getElementById("added"+id).innerText
    fetch(url + `/delete-post/${id}`, {
        method: "DELETE",
        body: JSON.stringify({
             mail
        }),
        headers: {
            'Content-type': 'application/json',
            Authorization: jwt_token
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            if (data.message === "Post deleted"){
                getPosts()
                state.page = 1
                setSearchString("")
                setDate("all")
            }
            else{
                let colDiv2 = document.getElementById("alertDiv")
                let alertDiv = document.createElement("div")
                alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
                alertDiv.setAttribute("role", "alert")
                alertDiv.setAttribute("style", "margin-top: 15px")
                alertDiv.setAttribute("id", "deletePostFailure")
                alertDiv.innerHTML = "<strong>Failure!</strong> " + data.message
                colDiv2.appendChild(alertDiv)
                deleteAlert("deletePostFailure")
            }
        })
        .catch((err)=>{
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "deletePostFailure")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("deletePostFailure")
        })
}


function onComment(id){
    let tagId = "dummyInputId"+id
    let valId = "dummyValueId"+id
    let commentDiv = document.getElementById("comment"+id)
    let midDiv = document.createElement("div")
    midDiv.setAttribute("id", tagId)
    midDiv.setAttribute("style", "margin-top:10px")
    commentDiv.appendChild(midDiv)
    let commentText = document.createElement("input")
    commentText.setAttribute("style", "padding:6px 6px")
    commentText.setAttribute("id", valId)
    midDiv.appendChild(commentText)
    let addComment = document.createElement("button")
    addComment.setAttribute("class", "btn btn-success")
    addComment.setAttribute("style", "margin-left:10px;margin-right: 5px;")
    addComment.setAttribute("value", id)
    addComment.setAttribute("onclick", "onAddComment(value)")
    addComment.innerText = "Add"
    midDiv.appendChild(addComment)

    let cancelComment = document.createElement("button")
    cancelComment.setAttribute("class", "btn btn-danger")
    cancelComment.setAttribute("style", "margin-right: 5px;")
    cancelComment.setAttribute("value", id)
    cancelComment.setAttribute("onclick", "onCancelComment(value)")
    cancelComment.innerText = "Cancel"
    midDiv.appendChild(cancelComment)
}


function onAddComment(postId){
    let comment = document.getElementById("dummyValueId"+postId).value
    fetch(url + `/add-comment`, {
        method: "POST",
        body: JSON.stringify({
            postId, comment
        }),
        headers: {
            'Content-type': 'application/json',
            Authorization : jwt_token
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            if(data.message === "Comment inserted"){
                getPosts()
            }
            else{
                let colDiv2 = document.getElementById("alertDiv")
                let alertDiv = document.createElement("div")
                alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
                alertDiv.setAttribute("role", "alert")
                alertDiv.setAttribute("style", "margin-top: 15px")
                alertDiv.setAttribute("id", "addCommentFailure")
                alertDiv.innerHTML = "<strong>Failure!</strong> " + data.message
                colDiv2.appendChild(alertDiv)
                deleteAlert("addCommentFailure")
            }
        })
        .catch((err)=>{
            let colDiv2 = document.getElementById("alertDiv")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "addCommentFailure")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("addCommentFailure")
        })


}

function onCancelComment(id){
    document.getElementById("dummyInputId"+id).remove()
}

document.getElementById('editPostFormId').addEventListener('submit', function(e) {
    e.preventDefault(); //to prevent form submission
    onSave();
  });

function onSave(){
    let id = document.getElementById("editSaveBtnId").value
    let title = document.getElementById("editTitleId").value 
    let description = document.getElementById("editDescId").value 
    let imagePath = document.getElementById("editImgPathId").value
    let mail = document.getElementById("added"+id).innerText
    fetch(url + `/edit-post/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            title, description, imagePath, mail
        }),
        headers: {
            'Content-type': 'application/json',
            Authorization: jwt_token
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            if(data.message === "Post edited"){
                let editDiv = document.getElementById("editPostDiv")
                let postListDiv = document.getElementById("postListDiv")
                editDiv.setAttribute("class", "row d-none")
                postListDiv.setAttribute("class", "")
                getPosts()
            }
            else{
                let colDiv2 = document.getElementById("saveAlertId")
                let alertDiv = document.createElement("div")
                alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
                alertDiv.setAttribute("role", "alert")
                alertDiv.setAttribute("style", "margin-top: 15px")
                alertDiv.setAttribute("id", "editPostFailure")
                alertDiv.innerHTML = "<strong>Failure!</strong> " + data.message
                colDiv2.appendChild(alertDiv)
                deleteAlert("editPostFailure")
            }
        })
        .catch((err)=>{
            let colDiv2 = document.getElementById("saveAlertId")
            let alertDiv = document.createElement("div")
            alertDiv.setAttribute("class", "alert alert-danger myAlert-bottom")
            alertDiv.setAttribute("role", "alert")
            alertDiv.setAttribute("style", "margin-top: 15px")
            alertDiv.setAttribute("id", "editPostFailure")
            alertDiv.innerHTML = "<strong>Failure!</strong> Internal Server Error"
            colDiv2.appendChild(alertDiv)
            deleteAlert("editPostFailure")
        })
    
}

function onCancel(){
    let editDiv = document.getElementById("editPostDiv")
    let postListDiv = document.getElementById("postListDiv")
    editDiv.setAttribute("class", "row d-none")
    postListDiv.setAttribute("class", "")
}


function onImagePathChange(){
    let imagePath = document.getElementById("editImgPathId").value
    let imageTag = document.getElementById("editImageId")
    imageTag.setAttribute("src", imagePath)

}


function pagination(dataset, page, rows){
    let start = (page - 1) * rows
    let end = start + rows
    let currentData = dataset.slice(start, end)
    let pages = Math.ceil(dataset.length / rows)
    return {
        "dataset" : currentData,
        "pages": pages
    }
}

function onPaginationClick(value){
    state.page = value
    createPosts()
}

function onPrevious(){
    if (state.page > 1){
        state.page = state.page - 1
        createPosts()
    }
}


function onNext(){
    let data = pagination(state.dataset, state.page, state.rows)
    if (state.page < data.pages){
        state.page = +state.page + 1
        createPosts()
    }
}

function buildNavBar(){
    let mainDiv = document.getElementById("mainDiv")
    let secondDiv = document.createElement("div")
    secondDiv.setAttribute("class", "d-flex justify-content-center")
    secondDiv.setAttribute("style", "margin-top:20px")
    mainDiv.appendChild(secondDiv)
    let navBar = document.createElement("nav")
    navBar.setAttribute("aria-label", "Page navigation exapmle")
    secondDiv.appendChild(navBar)
    let ul1 = document.createElement("ul")
    ul1.setAttribute("class", "pagination")
    navBar.appendChild(ul1)

    let lif = document.createElement("li")
    lif.setAttribute("class", "page-item")
    ul1.appendChild(lif)

    let af =  document.createElement("a")
    af.setAttribute("class", "page-link")
    af.setAttribute("aria-label", "Previous")
    af.setAttribute("onclick", "onPrevious()")
    lif.appendChild(af)

    let spanf1 = document.createElement("span")
    spanf1.setAttribute("aria-hidden", "true")
    spanf1.innerHTML = "&laquo;"
    af.appendChild(spanf1)

    let spanf2 = document.createElement("span")
    spanf2.setAttribute("class", "sr-only")
    spanf2.innerText = "Previous;"
    af.appendChild(spanf2)

    let pageData = pagination(state.dataset, state.page, state.rows)
    let pages = pageData.pages

    let count = 1
    while (count <= pages){
        let lic = document.createElement("li")
        lic.setAttribute("class", "page-item")
        ul1.appendChild(lic)

        let ac =  document.createElement("a")
        ac.setAttribute("class", "page-link")
        ac.setAttribute("id", count)
        ac.setAttribute("onclick", "onPaginationClick(this.id)")
        ac.innerText = count
        lic.appendChild(ac)
        count ++
    }

    let lil = document.createElement("li")
    lil.setAttribute("class", "page-item")
    ul1.appendChild(lil)


    let al =  document.createElement("a")
    al.setAttribute("class", "page-link")
    al.setAttribute("aria-label", "Next")
    al.setAttribute("onclick", "onNext()")
    lil.appendChild(al)

    let spanl1 = document.createElement("span")
    spanl1.setAttribute("aria-hidden", "true")
    spanl1.innerHTML = "&raquo;"
    al.appendChild(spanl1)

    let spanl2 = document.createElement("span")
    spanl2.setAttribute("class", "sr-only")
    spanl2.innerText = "Next"
    al.appendChild(spanl2)

}


function dateFilter(value){
    setSearchString("")
    let previousButton = document.getElementById(date_dict[currentDate])
    previousButton.setAttribute("class", "dropdown-item")
    currentDate = value
    let currentButton = document.getElementById(date_dict[currentDate])
    currentButton.setAttribute("class", "dropdown-item active")
    if (value !== "all"){
        let currDate = new Date(Date.now())
    //currDate.setDate(currDate.getDate()- value)
        currDate.setDate(currDate.getDate() - date_number[value]);
        let fileredData = posts.filter((data)=>{
                        return new Date(data.addedDate) >= currDate
                        })
        state.dataset = fileredData
    }
    else{
        state.dataset = posts
    }    
    state.page = 1
    createPosts()
}

function setPage(value){
    let previousButton = document.getElementById(rows_dict[currentRows])
    previousButton.setAttribute("class", "dropdown-item")
    currentRows = value
    let currentButton = document.getElementById(rows_dict[currentRows])
    currentButton.setAttribute("class", "dropdown-item active")
}

function setDate(value){
    let previousButton = document.getElementById(date_dict[currentDate])
    previousButton.setAttribute("class", "dropdown-item")
    currentDate = value
    let currentButton = document.getElementById(date_dict[currentDate])
    currentButton.setAttribute("class", "dropdown-item active")
}
setDate("all")
setSearchString("")
function rowsFilter(value){
    let previousButton = document.getElementById(rows_dict[currentRows])
    previousButton.setAttribute("class", "dropdown-item")
    currentRows = value
    let currentButton = document.getElementById(rows_dict[currentRows])
    currentButton.setAttribute("class", "dropdown-item active")
    state.page = 1
    state.rows = value
    createPosts()
}

function setSearchString(){
    document.getElementById("findTopicsId").value = ""
}

function onFindTopics(){
    let searrchString = document.getElementById("findTopicsId").value
    if (searrchString.trim() !==""){
        let fileredData = posts.filter((data)=>{
            return data.title.includes(searrchString)
            })
        state.dataset = fileredData
        setDate("all")
    }
    else{
        state.dataset = posts
        setDate("all")
    }
    state.page = 1
    createPosts()
}