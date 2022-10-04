const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const path = require("path");
const session = require("express-session");
const cors = require("cors");


//database
const connectDatabase = require("./database");


//middleware
const middleware = require("./middleware");

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cors());

//session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}))

//static file
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
})

//routes 
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logout");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

//API routes
const postsApiRoute = require("./routes/api/posts");
const { requireLogin } = require("./middleware");

app.use("/api/posts", requireLogin, postsApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.render("home", payload);
})

