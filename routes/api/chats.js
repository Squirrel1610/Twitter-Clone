const router = require("express").Router();
const Chat = require("../../schemas/Chat");
const Message = require("../../schemas/Message");

//create group chat
router.post("/", async (req, res, next) => {
    if(!req.body.users){
        console.log("Users param not sent with request");
        return res.sendStatus(400);
    }

    var users = JSON.parse(req.body.users);

    if(users.length == 0){
        console.log("Users array is empty");
        return res.sendStatus(400);
    }

    users.push(req.session.user);

    var chatData = {
        users,
        isGroupChat: true
    };

    Chat.create(chatData)
    .then((result) => {
        return res.status(200).send(result);
    })
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//get list chat
router.get("/", async (req, res, next) => {
    Chat.find(
        {
            users: {
                $elemMatch: {
                    $eq: req.session.user._id
                }
            }
        }
    )
    .populate("users")
    .populate("latestMessage")
    .sort({updatedAt: -1}) //sort updatedAt descending
    .then(async (chatList) => {
        if(req.query.unreadOnly){
            let result = chatList.filter(chat => chat.latestMessage &&  !chat.latestMessage.readBy.includes(req.session.user._id));
            return res.status(200).send(result);
        }

        chatList = await Chat.populate(chatList, {path: "latestMessage.sender"});
        return res.status(200).send(chatList);
    })
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(400);
    })
})

//change the chat name
router.put("/:chatId", async (req, res, next) => {
    Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then((chatData) => res.status(204).send(chatData))
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(204);
    })
})

//get chat by id
router.get("/:chatId", (req, res, next) => {
    Chat.findById(req.params.chatId)
    .populate("users")
    .then((chatData) => res.status(200).send(chatData))
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(204);
    })
})

//get message from chat
router.get("/:chatId/messages", async (req, res, next) => {
    Message.find({chat: req.params.chatId})
    .populate("chat")
    .populate("sender")
    .then((data) => res.status(200).send(data))
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//make all messages in the chat are read
router.put("/:chatId/messages/markAsRead", async (req, res, next) => {
    Message.updateMany({chat: req.params.chatId}, {
        $addToSet: {readBy: req.session.user._id}
    })
    .then(() => res.sendStatus(204))
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

module.exports = router;