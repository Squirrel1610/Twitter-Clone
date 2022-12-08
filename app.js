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
const io = require("socket.io")(server, { pingTimeout: 60000 });

//routes 
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logoutRoutes");
const postRoute = require("./routes/postRoutes");
const profileRoute = require("./routes/profileRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const searchRoute = require("./routes/searchRoutes");
const messagesRoute = require("./routes/messagesRoutes");
const notificationsRoute = require("./routes/notificationsRoutes");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", requireLogin, postRoute);
app.use("/profile", requireLogin, profileRoute);
app.use("/uploads", requireLogin, uploadRoute);
app.use("/search", requireLogin, searchRoute);
app.use("/messages", requireLogin, messagesRoute);
app.use("/notifications", requireLogin, notificationsRoute);

//API routes
const postsApiRoute = require("./routes/api/posts");
const usersApiRoute = require("./routes/api/users");
const chatsApiRoute = require("./routes/api/chats");
const messagesApiRoute = require("./routes/api/messages");

app.use("/api/users", requireLogin, usersApiRoute);
app.use("/api/posts", requireLogin, postsApiRoute);
app.use("/api/chats", requireLogin, chatsApiRoute);
app.use("/api/messages", requireLogin, messagesApiRoute);

//home page
app.get("/", requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    return res.render("home", payload);
})

io.on("connection", (socket) =>{
    console.log("connected to socketio");
    
    //setup connect
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    //when client emit event join room
    socket.on("join room", (chatId) => {
        socket.join(chatId);
    })

    //user typing in chatpage
    socket.on("typing", (chatId) => {
        socket.in(chatId).emit("typing");
    })

    //server listen on event stop typing and send the event to the room
    socket.on("stop typing", (chatId) => {
        socket.in(chatId).emit("stop typing");
    })

    //server listen on event new message when user send  message
    socket.on("new message", (newMessage) => {
        var chat = newMessage.chat;

        if(!chat.users) return console.log("Chat.users is not defined");

        chat.users.forEach(user => {
            if(user._id == newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    })
})