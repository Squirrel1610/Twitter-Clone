const User = require("../schemas/User");

const router = require("express").Router();

//profile page
router.get("/", async (req, res, next) => {
    var payload = await getPayload(req.session.user.username, req.session.user);
    return res.status(200).render("profilePage", payload);
})

//profile page of user is not logging
router.get("/:username", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    return res.status(200).render("profilePage", payload);
})

//tab followers
router.get("/:username/followers", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";

    return res.status(200).render("followersAndFollowing", payload);
})

//tab following
router.get("/:username/following", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";

    return res.status(200).render("followersAndFollowing", payload);
})

//tab replies
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