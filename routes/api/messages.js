const router = require("express").Router();
const Message = require("../../schemas/Message");
const Chat = require("../../schemas/Chat");
const User = require("../../schemas/User");

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

        Chat.findByIdAndUpdate(chatId, {
            latestMessage: message._id
        }).catch((error) => console.log(error.message));

        return res.status(201).send(message);
    })
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(400);
    })
})

module.exports = router;
