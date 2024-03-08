const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();


router.get("/login",authController.get_login);
router.get("/signup",authController.get_signup);
router.post("/login",authController.post_login);
router.post("/signup",authController.post_signup);
router.get("/logout",authController.get_logout);
router.get("/profile",authController.get_profile);
router.get("/forget-password",authController.get_forget_password);
router.post("/generateOtp",authController.post_generateOtp);
router.post("/verifyOtp",authController.post_verifyOtp);
router.get("/createNewPassword/:email",authController.get_createNewPassword);

module.exports=router;