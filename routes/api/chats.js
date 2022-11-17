const router = require("express").Router();
const Chat = require("../../schemas/Chat");

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

module.exports = router;