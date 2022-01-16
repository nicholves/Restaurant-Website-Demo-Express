function init() {
    document.getElementById("search").addEventListener("click", search);
}

function search() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("get", "http://localhost:3000/users?name=" + document.getElementById("searchBox").value, true); 
	xhttp.send();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            let results = document.getElementById("results");
            results.innerHTML = "";
            if (this.responseText == ""){
                results.innerHTML = "<p>No results found</p>"
            }

            let response = JSON.parse(this.responseText);

            let node = document.createElement("a");
            node.href = "http://localhost:3000/users/" + response._id.valueOf();
            node.innerHTML = response.username;
            results.appendChild(node);
		}
	}
    if (this.readyState == 4 && this.status == 403) {
        if (this.responseText == ""){
            results.innerHTML = "<p>No results found</p>"
        }
    }
}