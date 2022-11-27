const router = require("express").Router();
const Chat = require("../../schemas/Chat");

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
    .sort({updatedAt: -1}) //sort updatedAt descending
    .then((chatList) => res.status(200).send(chatList))
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

module.exports = router;