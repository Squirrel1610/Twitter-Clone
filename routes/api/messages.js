const router = require("express").Router();
const Message = require("../../schemas/Message");

router.post("/", async (req, res, next) => {
    const {chatId, content} = req.body;

    if(!chatId && !content){
        console.log("Invalid payload");
        return res.sendStatus(400);
    }

    let newMessage = {
        chat: chatId,
        sender: req.session.user,
        content
    };

    Message.create(newMessage)
    .then((message) => res.status(201).send(message))
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(400);
    })
})

module.exports = router;
