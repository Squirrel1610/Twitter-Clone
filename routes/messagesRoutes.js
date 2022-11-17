const router = require("express").Router();

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    return res.status(200).render("inboxPage", payload)
})

router.get("/new", (req, res, next) => {
    var payload = {
        pageTitle: "New Message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    return res.status(200).render("newMessage", payload)
})

module.exports = router;