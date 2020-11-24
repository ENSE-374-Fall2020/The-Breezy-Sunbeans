
// add all your boilerplate code up here
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

// new requires for passport
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

// allows using dotenv for environment variables
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// set up session
app.use(session({
    secret: process.env.SECRET, // stores our secret in our .env file
    resave: false,              // other config settings explained in the docs
    saveUninitialized: false
}));

// set up passport
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

// passport needs to use MongoDB to store users
mongoose.connect("mongodb://localhost:27017/oceanDB", 
                {useNewUrlParser: true, // these avoid MongoDB deprecation warnings
                 useUnifiedTopology: true});

// This is the database where our users will be stored
// Passport-local-mongoose handles these fields, (username, password), 
// but you can add additional fields as needed
const userSchema = new mongoose.Schema ({
    username: String,
    password: String,
    name: String,
    age: Number,
    city: String,
    description: String
})


// configure passportLocalMongoose
userSchema.plugin(passportLocalMongoose);

// Collection of users
const User = new mongoose.model("User", userSchema)

//Schema for messages
const messageSchema = new mongoose.Schema({
    _id: Number,
    to: userSchema,
    from: userSchema,
    message: String,
    creator: userSchema
});

const Message = mongoose.model("Message", messageSchema);

//Schema for meetings
const meetingSchema = new mongoose.Schema ({
    username1: String,
    username2: String,
    date: Date, //Date("<YYYY-mm-ddTHH:MM:ss>")
    description: String
});
//collection of meetings
const Meeting = new mongoose.model("Meeting", meetingSchema)



// more passport-local-mongoose config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const port = 4000; 

app.listen (port, function() {
    // code in here runs when the server starts
    console.log("Server is running on port " + port);
})

// root route
app.get("/", function(req, res){
    res.render("login")
});

// register route
app.post("/register", function(req, res) {
    console.log("Registering a new user");
    // calls a passport-local-mongoose function for registering new users
    // expect an error if the user already exists!
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/")
        } else {
            // authenticate using passport-local
            // what is this double function syntax?! It's called currying.
            var query = {"username" : req.body.username};
            var updates = { $set : {name: req.body.name, age: req.body.age, city: req.body.city, description: req.body.description}};
            User.updateOne(query, updates, function(err, res) {
                    if (err) throw err;
                }
            )
            //console.log("updated " + req.body.username + " with " + req.body.name + " and " + req.body.description)//
            passport.authenticate("local")(req, res, function(){
                res.redirect("/dashboard")
            });
        }
    });
});

// login route
app.post("/login", function(req, res) {
    console.log("A user is logging in")
    // create a user
    const user = new User ({
        username: req.body.username,
        password: req.body.password
     });
     // try to log them in
    req.login (user, function(err) {
        if (err) {
            // failure
            console.log(err);
            res.redirect("/")
        } else {
            // success
            // authenticate using passport-local
            passport.authenticate("local")(req, res, function() {
                res.redirect("/dashboard"); 
            });
        }
    });
});

// logout
app.get("/logout", function(req, res){
    console.log("A user logged out")
    req.logout();
    res.redirect("/");
})

// show the home page
app.get("/dashboard", function(req, res){
    console.log("A user is accessing dashboard")
    if (req.isAuthenticated()) {
        res.render("dashboard", {user: req.user.username})    
    } else {
        res.redirect("/");
    }

});

// show the profile page
app.get("/profile", function(req, res){
    console.log("A user is accessing profile")
    if (req.isAuthenticated()) {
        User.find({"username": req.user.username}, function(err, results){
            if (err) {
                console.log(err);
            } else {
                console.log(results)
                userInfo = results[0];

            }
            res.render("profile", {user: req.user.username, userInfo: userInfo})   
        }) 
    } else {
        res.redirect("/");
    }

});

// updateProfile route
app.post("/updateProfile", function(req, res) {
    console.log("Updating a user");
    console.log("user is: " + req.body.username + " name: " + req.body.name + " age: " + req.body.age + " city: " + req.body.city + " description: " + req.body.description)
    var query = {"username" : req.body.username};
    var updates = { $set : {name: req.body.name, age: req.body.age, city: req.body.city, description: req.body.description}};
    User.updateOne(query, updates, function(err, res) {
            if (err) throw err;
        }
    )
    res.redirect("/profile");
});

// show the messaging page
app.get("/messaging", function (req, res) {
    if (req.isAuthenticated()) {
        var messageArray = [];

        Message.find({}, (err, message) => {
            if (err) {

            } else {
                message.forEach((Message) => {
                    messageArray.push(Message);
                })
            }
            res.render("messaging", {
                username: req.user.username,
                message: messageArray
            })
            console.log(message)
            
        })
    } else {
        res.redirect("/");
    }
});

app.post("/send", function (req, res) {

    console.log(req.body.messagelength)
    Message.create({
        _id: req.body.messagelength,
        message: req.body.input,
        creator: req.user
    }, function () {
        req.body.messagelength++;
        console.log(req.body.messagelength)
        res.redirect('/messaging');
    });
});