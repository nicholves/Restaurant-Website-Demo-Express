function init() {
    document.getElementById("logoutbtn").addEventListener("click", logout);
}

function logout() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:3000/logout", true); 
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({logout: true}));
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            window.location.href = "http://localhost:3000/";
            return;
        }
        else if (this.readyState == 4) {
            alert("logout failed!");
        }
    }
}