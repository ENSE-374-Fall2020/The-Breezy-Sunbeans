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
app.use(bodyParser.urlencoded({ extended: true }));
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
    {
        useNewUrlParser: true, // these avoid MongoDB deprecation warnings
        useUnifiedTopology: true
    });

// This is the database where our users will be stored
// Passport-local-mongoose handles these fields, (username, password), 
// but you can add additional fields as needed
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    age: Number,
    city: String,
    description: String,
    activeSports: String,
    technology: String,
    nature: String,
    food: String,
    travel: String,
    pets: String
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
const meetingSchema = new mongoose.Schema({
    type: String,
    username1: String,
    username2: String,
    date: String, //Date("<YYYY-mm-ddTHH:MM:ss>")
    description: String
});
//collection of meetings
const Meeting = new mongoose.model("Meeting", meetingSchema)



// more passport-local-mongoose config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const port = 4000;
app.listen(port, function () {
    // code in here runs when the server starts
    console.log("Server is running on port " + port);
})

// root route, shows the home page
app.get("/", function (req, res) {
    res.render("home")
});

//show login/register page
app.get("/login", function (req, res) {
    res.render("login")
});

// register route
app.post("/register", function (req, res) {
    console.log("Registering a new user");
    // calls a passport-local-mongoose function for registering new users
    // expect an error if the user already exists!
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/")
        } else {
            // authenticate using passport-local
            // what is this double function syntax?! It's called currying.
            //console.log("activeSports: " + req.body.activeSports + " technology: " + req.body.technology)
            var query = { "username": req.body.username };
            var updates = { $set: { name: req.body.name, age: req.body.age, city: req.body.city, description: req.body.description, activeSports: req.body.activeSports, technology: req.body.technology, nature: req.body.nature, food: req.body.food, travel: req.body.travel, pets: req.body.pets } };
            User.updateOne(query, updates, function (err, res) {
                if (err) throw err;
            }
            )
            //console.log("updated " + req.body.username + " with " + req.body.name + " and " + req.body.description)//
            passport.authenticate("local")(req, res, function () {
                res.redirect("/dashboard")
            });
        }
    });
});

// login route
app.post("/login", function (req, res) {
    console.log("A user is logging in")
    // create a user
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    // try to log them in
    req.login(user, function (err) {
        if (err) {
            // failure
            console.log(err);
            res.redirect("/")
        } else {
            // success
            // authenticate using passport-local
            passport.authenticate("local")(req, res, function () {
                res.redirect("/dashboard");
            });
        }
    });
});

// logout
app.get("/logout", function (req, res) {
    console.log("A user logged out")
    req.logout();
    res.redirect("/");
})

// show the dashboard
app.get("/dashboard", function (req, res) {
    console.log("A user is accessing dashboard")
    if (req.isAuthenticated()) {
        Meeting.find(function (err, results) {
            if (err) {
                console.log(err);
            } else {
                //console.log(results)
                allMeetings = results
            }
            res.render("dashboard", { user: req.user.username, meetings: allMeetings })
        })
    } else {
        res.redirect("/");
    }
});

//meeting edit route
app.post("/meetingView", function (req, res) {
    console.log("A user is about to view a meeting")

    req.session.valid = req.body._id
    res.redirect("/meetup");
});

//meeting edit route
app.post("/meetingEdit", function (req, res) {
    console.log("A user is about to edit a meeting")

    req.session.valid = req.body._id
    res.redirect("/meeting_edit");
});

//meeting create route, creates a meeting in the database and sends the id to meeting_edit
app.post("/meetingCreate", function (req, res) {
    console.log("A user is accessing creating a meeting")
    var inserts = {
        type: "",
        username1: req.user.username,
        username2: "",
        date: "Oct 25",
        description: ""
    }
    Meeting.create(inserts, function (err, results) {
        if (err) {
            // failure
            console.log(err);
        } else {
            // success
            //console.log(results)
            var meeting_id = results._id
            req.session.valid = meeting_id;
            res.redirect("/meeting_edit");
        }
    });
});

// show the meeting edit page. Must have a meeting id in req.session.valid
app.get("/meeting_edit", function (req, res) {
    console.log("A user is accessing meeting edit")
    if (req.isAuthenticated()) {
        if (req.session.valid) {
            var meeting_id = req.session.valid
            req.session.valid = null

            var query = { "_id": meeting_id };
            Meeting.find(query, function (err, results) {
                if (err) {
                    // failure
                    console.log(err);
                } else {
                    // success
                    //console.log(results)
                    meeting = results[0]
                }
                res.render("meeting_edit", { user: meeting.username1, type: meeting.type, username2: meeting.username2, description: meeting.description, date: meeting.date, _id: meeting._id })
            })
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
    req.session.valid = null
});

// updateMeeting route
app.post("/updateMeeting", function (req, res) {
    console.log("Updating a meeting");
    //console.log("user1 is: " + req.body.username + " username2: " + req.body.username2 + " description: " + req.body.description + " date: " + req.body.date)
    var query = { "_id": req.body._id };
    var updates = { $set: { type: req.body.type, username1: req.body.username, username2: req.body.username2, description: req.body.description, date: req.body.date } };

    Meeting.updateOne(query, updates, function (err, results) {
        if (err) {
            // failure
            console.log(err);
        } else {
            // success
            //console.log(results)
        }
        res.redirect("/dashboard");
    })
});

// deleteMeeting route
app.post("/deleteMeeting", function (req, res) {
    console.log("Deleteing a meeting");
    var query = { "_id": req.body._id };

    Meeting.deleteOne(query, function (err, results) {
        if (err) {
            // failure
            console.log(err);
        } else {
            // success
            //console.log(results)
        }
        res.redirect("/dashboard");
    })
});

// show the meetup page
app.get("/meetup", function (req, res) {
    console.log("A user is accessing meetup")
    if (req.isAuthenticated()) {
        if (req.session.valid) {
            var meeting_id = req.session.valid
            req.session.valid = null

            //Get the meeting inforamtion, inclucing username1 and username2
            var meetingQuery = { "_id": meeting_id };
            Meeting.find(meetingQuery, function (err, results) {
                if (err) {
                    // failure
                    console.log(err);
                } else {
                    // success
                    //console.log(results)
                    meeting = results[0]
                }
                //find info on username1
                var user1Query = { "username": meeting.username1 };
                User.find(user1Query, function (err, results) {
                    if (err) {
                        // failure
                        console.log(err);
                    } else {
                        // success
                        //console.log(results)
                        user1Name = results[0].name
                    }
                    if (meeting.username2 == ""){
                        res.render("meetup", { user: req.user.username, username1: meeting.username1, user1Name: user1Name, username2: meeting.username2, type: meeting.type, description: meeting.description, date: meeting.date, _id: meeting._id })
                    }else{
                        //find info on username2
                        var user2Query = { "username": meeting.username2 };
                        User.find(user2Query, function (err, results) {
                            if (err) {
                                // failure
                                console.log(err);
                            } else {
                                // success
                                //console.log(results)
                                user2Name = results[0].name
                            }
                            res.render("meetup", { user: req.user.username, username1: meeting.username1, user1Name: user1Name, username2: meeting.username2, user2Name: user2Name, type: meeting.type, description: meeting.description, date: meeting.date, _id: meeting._id })
                        })
                    }
                })
            })
        } else {
            console.log("no session valid")
            res.redirect("/");
        }
    } else {
        console.log("not authenticated")
        res.redirect("/");
    }
    req.session.valid = null
});

// meetingJoin route
app.post("/meetingJoin", function (req, res) {
    console.log("Joining " + req.body.username2 + " to a meetup with id: " + req.body._id);
    var query = { "_id": req.body._id };
    var updates = { $set: { username2: req.body.username2 } };

    Meeting.updateOne(query, updates, function (err, results) {
        if (err) {
            // failure
            console.log(err);
        } else {
            // success
            //console.log(results)
        }
        res.redirect("/dashboard");
    })
});

// show the profile page
app.get("/profile", function (req, res) {
    console.log("A user is accessing profile")
    if (req.isAuthenticated()) {
        User.find({ "username": req.user.username }, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                //console.log(results)
                userInfo = results[0];
            }
            res.render("profile", { user: req.user.username, userInfo: userInfo })
        })
    } else {
        res.redirect("/");
    }
});

// View someone else's profile 
app.post("/viewprofile", function (req, res) {
    console.log("A user is viewing someone else's profile")
    if (req.isAuthenticated()) {
        User.find({ "username": req.body.username }, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                //console.log(results)
                userInfo = results[0];
            }
            res.render("viewprofile", { user: req.user.username, userInfo: userInfo })
        })
    } else {
        res.redirect("/");
    }
});

// updateProfile route
app.post("/updateProfile", function (req, res) {
    console.log("Updating a user");
    //console.log("user is: " + req.body.username + " name: " + req.body.name + " age: " + req.body.age + " city: " + req.body.city + " description: " + req.body.description)
    var query = { "username": req.body.username };
    var updates = { $set: { name: req.body.name, age: req.body.age, city: req.body.city, description: req.body.description, activeSports: req.body.activeSports, technology: req.body.technology, nature: req.body.nature, food: req.body.food, travel: req.body.travel, pets: req.body.pets } };
    User.updateOne(query, updates, function (err, results) {
        if (err) throw err;

        res.redirect("/profile");
    })
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

// show the match page
app.get("/match", function (req, res) {
    console.log("A user is matching")
    if (req.isAuthenticated()) {
        User.find({ "username": req.user.username }, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                //console.log(results)
                userInfo = results[0];
            }
            if (userInfo.activeSports || userInfo.technology || userInfo.nature || userInfo.food || userInfo.travel || userInfo.pets){
                match = "on"
                //create an array of all of the interests the user has
                var interestArray = []
                var interestCounter = 0
                if (userInfo.activeSports){
                    interestArray[interestCounter] = "activeSports"
                    interestCounter++
                }if (userInfo.technology){
                    interestArray[interestCounter] = "technology"
                    interestCounter++
                }if (userInfo.nature){
                    interestArray[interestCounter] = "nature"
                    interestCounter++
                }if (userInfo.food){
                    interestArray[interestCounter] = "food"
                    interestCounter++
                }if (userInfo.travel){
                    interestArray[interestCounter] = "travel"
                    interestCounter++
                }if (userInfo.pets){
                    interestArray[interestCounter] = "pets"
                    interestCounter++
                }
                //console.log("My array is: " + interestArray)
                //pick a random interest from that array
                var interestToMatch = Math.floor((Math.random() * interestCounter)); //returns a number between interestCounter and 0
                var interestToSearch = interestArray[interestToMatch]
                //console.log("Interest to seach is " + interestToSearch)

                var value = "on";
                var interestQuery = {};
                interestQuery[interestToSearch] = value;
                //console.log("interestQuery is " + interestQuery[0])
                //search for other users with that same interest
                User.find(interestQuery, function (err, results) { 
                    if (err) {
                        console.log(err);
                    } else {
                        //console.log(results)
                        var randomUser = Math.floor((Math.random() * results.length));
                        //console.log("Random number for suer is " + randomUser)
                        userInfo2 = results[randomUser];
                    }
                    res.render("match", { user: req.user.username, match: match, interest: interestToSearch, userInfo: userInfo, userInfo2: userInfo2 })
                });
            }else {
                match = ""
                res.render("match", { user: req.user.username, match: match, userInfo: userInfo })
            }
        })
    } else {
        res.redirect("/");
    }
});

//match create route
app.post("/matchCreate", function (req, res) {
    console.log("A user is accessing creating a meeting")
    var inserts = {
        type: "",
        username1: req.user.username,
        username2: req.body.username2,
        date: "Oct 25",
        description: "You both like: " + req.body.interest
    }
    Meeting.create(inserts, function (err, results) {
        if (err) {
            // failure
            console.log(err);
        } else {
            // success
            //console.log(results)
            var meeting_id = results._id
            req.session.valid = meeting_id;
            res.redirect("/meeting_edit");
        }
    });
});