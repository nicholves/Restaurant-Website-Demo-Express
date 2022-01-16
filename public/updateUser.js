function init() {
    document.getElementById("saveButton").addEventListener("click", updateProfile);
    var uid = uid;
}

function updateProfile() {
    let privacy = document.getElementById("privacyCheckbox").checked;


    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:3000/users/", true); 
    xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify({private: privacy}));
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            alert("changes saved");
		}
        else if (this.readyState == 4 && this.status == 500) {
            alert("server error!");
		}
        else if (this.readyState == 4 && this.status == 403) {
            alert("Forbidden");
		}
        else if (this.readyState == 4 && this.status == 401) {
            alert("Unauthorized");
		}
	}
}