const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB",
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
      userid: user.userid,
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, userid, password } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  
  User.findOne({ $or: [ {email}, {userid} ] },(err, user)=> {
    if (err || !user) {
      return res.status(400).json({
        error: "Email does not exist",
      });
    }

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email and Password do not match",
      });
    }

    // create token
    const token = jwt.sign({ _id: user._id, userid: user.userid }, process.env.SECRET);
    // put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    // send response to front end
    const { _id, name, userid, email , status = 1} = user;
    console.log({user: { _id, name, userid, email }});
    return res.json({ token, user: { _id, userid  , status} });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User Signout successfully",
  });
};

// protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

// custom middleware
exports.isAuthentication = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "Acess Denide",
    });
  }
  next();
};
