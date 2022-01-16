function init() {
    document.getElementById("register").addEventListener("click", register);
}

function register() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;


    let xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "http://localhost:3000/users", true); 
    xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify({username: username, password: password, privacy: false}));
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 201) {
            login();
		}
        else if (this.readyState == 4 && this.status == 500) {
            alert("server error!");
		}
        else if (this.readyState == 4 && this.status == 403) {
            alert("Username already taken");
		}
	}
}



function login() {
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value


    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:3000/login", true); 
    xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify({username: username, password: password}));
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            alert("logged in");
            window.location.href = "http://localhost:3000/users/" + this.responseText;
		}
        else if (this.readyState == 4 && this.status == 500) {
            alert("server error!");
		}
        else if (this.readyState == 4 && this.status == 401) {
            alert("Invalid username or password");
		}
        else if (this.readyState == 4 && this.status == 403) {
            alert("You're already logged in elsewhere");
		}
	}
}