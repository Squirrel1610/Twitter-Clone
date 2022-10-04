const router = require("express").Router();
const User = require("../schemas/User");
const bcrypt = require("bcrypt");

router.get("/", (req, res, next) => {
    const payload = {
        pageTitle: "Register"
    }

    return res.status(200).render("register", payload);
})

router.post("/", async (req, res, next) => {
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = {
        ...req.body,
        pageTitle: "Register"
    }

    if(firstName && lastName && username && email && password){
        var user = await User.findOne({
            $or: [
                {"username": username},
                {"email": email}
            ]
        })
        .catch(err => {
            console.log(err.message);
            payload.errorMessage = "Something went wrong";
            return res.status(200).render("register", payload);
        })

        if(!user){
            //not found user in db
            var data = req.body;
            data.password = await bcrypt.hashSync(data.password, 10);

            const user = await User.create(data)
            .catch(err => {
                console.log(err.message);
                payload.errorMessage = "Server error, please try again";
                return res.status(200).render("register", payload);
            })
            req.session.user = user;
            
            return res.redirect("/");
        }else{
            //User found
            if(email == user.email){
                payload.errorMessage = "Email is already in use"
            }else{
                payload.errorMessage = "Username is already in use"
            }

            return res.status(200).render("register", payload)
        }
    }else{
        payload.errorMessage = "Make sure each field has a valid value"
        return res.status(200).render("register", payload);
    }
})

module.exports = router;