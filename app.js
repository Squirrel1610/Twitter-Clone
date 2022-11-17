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
const { requireLogin } = require("./middleware");

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
const logoutRoute = require("./routes/logoutRoutes");
const postRoute = require("./routes/postRoutes");
const profileRoute = require("./routes/profileRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const searchRoute = require("./routes/searchRoutes");
const messagesRoute = require("./routes/messagesRoutes");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", requireLogin, postRoute);
app.use("/profile", requireLogin, profileRoute);
app.use("/uploads", requireLogin, uploadRoute);
app.use("/search", requireLogin, searchRoute);
app.use("/messages", requireLogin, messagesRoute);

//API routes
const postsApiRoute = require("./routes/api/posts");
const usersApiRoute = require("./routes/api/users");
const chatsApiRoute = require("./routes/api/chats");

app.use("/api/users", requireLogin, usersApiRoute);
app.use("/api/posts", requireLogin, postsApiRoute);
app.use("/api/chats", requireLogin, chatsApiRoute);

app.get("/", requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    return res.render("home", payload);
})

