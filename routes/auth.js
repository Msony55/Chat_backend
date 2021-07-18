var express = require('express');
var router = express.Router();
const {check, oneOf} = require('express-validator');
const {signout,signup,signin} = require("../controllers/auth");

router.post("/signin",[ oneOf([
    check("email","email is require").isEmail(),
    check("userid","userid is require").isLength({min:3})]),
    check("password","password field is required").isLength({min:1})
],signin);

router.post("/signup",[
    check("name","name should be at least 3 char").isLength({min:3}),
    check("email","email is require").isEmail(),
    check("password","password is atlest 3 char").isLength({min:3}),
    check("userid","userid should be at least 3 char").isLength({min:3}),
],signup);

router.get("/signout", signout);

// router.get("/testroute",isSignedIn,(req,res) => {
//     res.json(req.auth);
// });

module.exports = router;