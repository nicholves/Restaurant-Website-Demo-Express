//Nicholas Veselskiy

// const fs = require("fs");
const pug = require("pug");
const session = require("express-session");
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

app.set("view engine", "pug");

let mongoStore = new MongoDBStore({
    uri: "mongodb://localhost:27017/restaurant",
    collection: "sessiondata"
})

app.use(session({secret: "some secret", store: mongoStore}));
app.use(express.static("public"));
app.get("/order", auth, renderOrder);
app.get("/", renderHome);
app.get("/users", queryParser, renderUsers);
app.get("/users/:uid", renderOneProfile);
app.get("/my-profile", auth, renderMyProfile);
app.get("/login", getLoginPage);
app.get("/registration", getRegistration);
app.get("/orders/:oid", renderOneOrder);
app.post("/login", express.json(), login);
app.post("/logout", express.json(), logout);
app.post("/users", express.json(), auth, updatePrivacy);
app.post("/orders", express.json(), auth, processOrder, processUserOrder)
app.put("/users", express.json(), registerUser);

//checks if user is signed in
function auth(req, res, next) {
    if(!req.session.username || !req.session.loggedIn){
		res.status(401).send("Unauthorized");
		return;
	}

	next();
}

//gets the name query prepared for further functions
function queryParser(req, res, next) {
    if (req.query.hasOwnProperty("name")) {
        req.query.noQuery = false;
        next();
        return;
    } 
    req.query.noQuery = true;
    next();
}


function renderOrder(req, res) {
    res.render("orderform", {loggedIn: req.session.loggedIn});
}

function renderHome(req, res) {
    res.render("home", {loggedIn: req.session.loggedIn});
}

function renderUsers(req, res) {
    if (!req.query.noQuery) {
        mongoose.connection.db.collection("users").findOne({username: req.query.name}, function(err, result) {
            if (err) {
                res.status(500).send();
                return;
            }
            if (result == null) { //user was not found
                res.status(200).send(null);
                return;
            }

            if (!result.privacy) { //user was found and was public
                res.status(200).send(JSON.stringify(result));
            }

            else if(result.privacy && req.query.name == req.session.username && req.session.loggedIn) { //user was found but was private
                res.status(200).send(JSON.stringify(result));
            }
            else {
                res.status(200).send(null); //user 
            }
        });
            
    }

    else {
        res.render("users", {loggedIn: req.session.loggedIn});
    }
}

function renderMyProfile(req, res) {
    mongoose.connection.db.collection("users").findOne({username: req.session.username}, function(err, result) { 
        if (req.session.loggedIn == true) {
            res.render("profile", {data: JSON.stringify(result)});
        } else {
            res.status(403).send();
        }
    });
}

function renderOneProfile(req, res) {
    mongoose.connection.db.collection("users").findOne({_id: mongoose.Types.ObjectId(req.params.uid)}, function(err, result) {
        if (err) {
            res.status(500).send("Error");
			return;
        }

        if (result == null) {
            res.status(404).send(); // no such user exists
            return;
        }
        else if (result.privacy && req.session.username != result.username) {
            res.status(403).send(); // user is private
        }

        else if (req.session.username != result.username || !req.session.loggedIn) {
            res.render("user", {loggedIn: req.session.loggedIn, data: JSON.stringify(result)});
        }

        else if (req.session.username == result.username && req.session.loggedIn) {
            res.render("profile", {data: JSON.stringify(result)});
        }

        else {
            res.status(500).send(); //something went wrong
        }
    });
}



function getLoginPage(req, res) {
    res.sendFile(path.join(__dirname, './public', 'login.html'));
}

function login(req, res) {
    let flag = false;
    if(req.session.username && req.session.loggedIn){
		res.status(200).send();
		return;
	}

    let profile = req.body;
    mongoose.connection.db.collection("users").findOne({username: profile.username}, function(err, result) {
        if(err){
			res.status(500).send(); //server error
			return;
		}

        if (result == null) {
            res.status(401).send(); //no username exists
            return;
        }

        if (result.password == profile.password) {
            mongoStore.all(function (err, results) {
                if (err) {
                    res.status(500).send();
                    flag = true;
			        return;
                }
                if (result == null) { //no sessions found
                    return;
                }
                
                for (let session of results) {
                    if (session.session.loggedIn && session.session.username == profile.username) {
                        flag = true;
                        res.status(403).send(); //user is logged in elsewhere
                        break;
                    }
                }

                if (!flag) {
                    req.session.loggedIn = true;
                    req.session.username = profile.username;
                    res.status(200).send(result._id.valueOf()); //succesfully logged in
                    return;
                }
            });
        } else {
            res.status(401).send(); //password invalid
        }
    });
}

function logout(req, res) {
    if(!req.session.username || !req.session.loggedIn){
		res.status(401).send("not signed in");
		return;
	}

    req.session.loggedIn = false;
    res.status(200).send();
}

function updatePrivacy(req, res) {
    mongoose.connection.db.collection("users").updateOne({username: req.session.username}, {$set: {privacy: req.body.private}}, function (err, result) {
        if (err) {
            res.status(500).send();
            return;
        }
        res.status(200).send();
    });
}

function getRegistration(req, res) {
    res.sendFile(path.join(__dirname, './public', 'register.html'));
}

function registerUser(req, res) {
    let profile = req.body;
    mongoose.connection.db.collection("users").findOne({username: profile.username}, function(err, result) {
        if (err) {
            res.status(500).send();
            return;
        }

        if (result == null) {
            mongoose.connection.db.collection("users").insertOne(profile, function(err, result) {
                res.status(201).send();
            });
            return;
        }
        res.status(403).send();
    });
}

function processOrder(req, res, next) {
    let order = {};
    let body = req.body;
    order.user = req.session.username;
    order.restName = body.restaurantName;
    order.items = body.order;
    order.subtotal = body.subtotal;
    order.fee = body.fee;
    order.tax = body.tax;
    order.total = body.total;
    mongoose.connection.db.collection("orders").insertOne(order, function(err, result) {
        if (err) {
            res.status(500).send();
            return;
        }
        req.app.oid = result.insertedId;
        next();
    });
}



function processUserOrder(req, res) {
    mongoose.connection.db.collection("users").findOne({username: req.session.username}, function(err, result) {
        if (result.hasOwnProperty("orders")) {
            result.orders.push(req.app.oid)
        } else {
            result.orders = [req.app.oid];
        }
        mongoose.connection.db.collection("users").replaceOne({username: req.session.username}, result, function(err, result) {
            if (err) {
                res.status(500).send();
                return;
            }
            res.status(200).send();
        })
        
    });
}

function renderOneOrder(req, res) {
    mongoose.connection.db.collection("orders").findOne({_id: mongoose.Types.ObjectId(req.params.oid)}, function(err, result) {
        if (err) {
            res.status(500).send("Error");
			return;
        }
        if (result == null) {
            res.status(404).send("no order exists with this id"); // no such order exists
            return;
        }

        else if (result.user == req.session.username && req.session.loggedIn) {
            res.render("order", {loggedIn: req.session.loggedIn, data: JSON.stringify(result)});
            return;
        }

        mongoose.connection.db.collection("users").findOne({username: result.user}, function(err1, orderer) {
            if (err1) {
                res.status(500).send("Error");
                return;
            }
            if (!orderer.privacy) {
                res.render("order", {loggedIn: req.session.loggedIn, data: JSON.stringify(result)});
            }
            else {
                res.status(403).send("You are not permitted to view this order");
            }
        });
    });
}

mongoose.connect('mongodb://localhost/restaurant', {useNewUrlParser: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
		app.listen(3000);
		console.log("Server listening on port 3000");
	});