const express = require('express');
const router = express.Router();

const { getUserById, getUser , updateUser } = require("../controllers/user");
const {  isSignedIn ,isAuthentication} = require("../controllers/auth");

router.param("userId", getUserById);

router.get("/user/:userId", isSignedIn,isAuthentication ,getUser);
// router.get("/users",getAllUsers);
router.put("/user/:userId", isSignedIn,isAuthentication ,updateUser);

module.exports = router;