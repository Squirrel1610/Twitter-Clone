const router = require("express").Router();
const Chat = require("../../schemas/Chat");
const Message = require("../../schemas/Message");
const Notification = require("../../schemas/Notification");

//get notification list for notificationPage
router.get("/", async (req, res, next) => {
    let searchObj = {
        userTo: req.session.user._id,
        notificationType: { $ne: "newMessage" }
    }

    if(req.query.unreadOnly){
        searchObj.opened = false;
    }

    Notification.find(searchObj)
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then((results) => res.status(200).send(results))
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//mark you have read the notification
router.put("/:notificationId/markAsOpened", async (req, res, next) =>{
    Notification.findByIdAndUpdate(req.params.notificationId, {
        opened: true
    })
    .then(() => res.sendStatus(204))
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//mark all the notification be read
router.put("/markAsOpened", async (req, res, next) =>{
    Notification.updateMany(
        {
            userTo: req.session.user._id,
            notificationType: { $ne: "newMessage" }
        },
        {
            opened: true
        }
    )
    .then(() => res.sendStatus(204))
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//get latest notification
router.get("/latest", async (req, res, next) => {
    Notification.findOne({userTo: req.session.user._id})
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then((result) => res.status(200).send(result))
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})



module.exports = router;