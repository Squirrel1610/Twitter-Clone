const User = require("../schemas/User");

const router = require("express").Router();


router.get("/", async (req, res, next) => {
    var payload = await getPayload(req.session.user.username, req.session.user);
    return res.status(200).render("profilePage", payload);
})

router.get("/:username", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    return res.status(200).render("profilePage", payload);
})

router.get("/:username/replies", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "replies";

    return res.status(200).render("profilePage", payload);
})

async function getPayload(username, userLoggedIn){
    var user = await User.findOne(
        {
            username
        }
    )

    if(!user){
        //if can not find by username then find by id
        user = await User.findById(username);

        if(!user){
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }     
    }

    return {
        pageTitle: "Profile",
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}

module.exports = router;