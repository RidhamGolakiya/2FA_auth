const authController = require("../controllers/authController");
const express = require("express");
const router = express.Router();

router.get("/", authController.getSignup);
router.get("/login", authController.getLogin);
router.get("/dashboard", authController.getDashboard);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/two-auth", authController.authEnable);
router.post("/check-auth", authController.checkAuth);

module.exports = router;
