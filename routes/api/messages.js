const router = require("express").Router();
const Message = require("../../schemas/Message");
const Chat = require("../../schemas/Chat");
const User = require("../../schemas/User");
const Notification = require("../../schemas/Notification");

//send message
router.post("/", async (req, res, next) => {
    const {chatId, content} = req.body;

    if(!chatId || !content){
        console.log("Invalid payload");
        return res.sendStatus(400);
    }

    let newMessage = {
        chat: chatId,
        sender: req.session.user,
        content
    };

    Message.create(newMessage)
    .then(async (message) => {
        message = await message.populate("sender");
        message = await message.populate("chat");
        message = await User.populate(message, { path: "chat.users"});

        var chat = await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message._id
        }).catch((error) => console.log(error.message));

        insertNotification(chat, message);

        return res.status(201).send(message);
    })
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(400);
    })
})

function insertNotification(chat, message){
    chat.users.forEach(async (userId) => {
        if(userId == message.sender._id.toString()) return;

        await Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
    });
}

module.exports = router;
