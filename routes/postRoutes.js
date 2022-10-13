const router = require("express").Router();

router.get("/:postId", (req, res, next) => {
    const payload = {
        pageTitle: "View Post",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.postId
    }

    return res.render("postPage", payload);
})

module.exports = router;