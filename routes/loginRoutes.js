const User = require("../schemas/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Login"
    }

    return res.status(200).render("login", payload);
})

router.post("/", async (req, res, next) => {
    var payload = {
        ...req.body,
        pageTitle: "Login"
    }

    if(req.body.logUsername && req.body.logPassword){
        const user = await User.findOne({
            $or: [
                {username: req.body.logUsername},
                {email: req.body.logUsername}
            ]
        }).catch(err => {
            console.log(err.message);
            payload.errorMessage = "Server error, please try again";
            return res.status(200).render("login", payload);
        })

        if(user){
            //check password is matched
            const isMatched = await bcrypt.compareSync(req.body.logPassword, user.password);
            if(isMatched){
                req.session.user = user;
                return res.redirect("/")
            } 
        }

        payload.errorMessage = "Login credentials are incorrect, please try again";
        return res.status(200).render("login", payload);
    }
})

module.exports = router;