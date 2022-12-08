const router = require("express").Router();

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Notification",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    return res.status(200).render("notificationPage", payload);
})

module.exports = router;