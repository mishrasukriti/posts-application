let url = "http://localhost:3000"

let objectId = ""
function onLoad(){
    let resetURL = new URL(window.location.href)
    objectId = resetURL.searchParams.get("id");
    let randomString = resetURL.searchParams.get("ac");
    fetch(url + `/activate_account`, {
        method: "POST",
        body: JSON.stringify({
            objectId, randomString
        }),
        headers: {
            'Content-type': 'application/json'
        }
        })
        .then((resp) => resp.json())
        .then((data) => {
            let resetPage = document.getElementById("resetPageId")
            resetPage.setAttribute("class", "login-page")
            if (data.message !== 'Verification success'){                
                let resetDiv = document.getElementById("unauthFormDiv")
                resetDiv.setAttribute("class", "form")
                
            
            } 
            else{
                let resetDiv = document.getElementById("passFormDiv")
                resetDiv.setAttribute("class", "form")
            }
        })
        .catch((err)=>{
            
            let resetPage = document.getElementById("resetPageId")
            resetPage.setAttribute("class", "login-page")
            let resetDiv = document.getElementById("unauthFormDiv")
            resetDiv.setAttribute("class", "from")

        })
}

onLoad()
