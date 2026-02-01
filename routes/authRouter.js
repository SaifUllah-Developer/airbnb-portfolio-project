// External Modules
const express = require("express");
const authRouter = express.Router();

// Local Modules
const authController = require("../controllers/authController");

authRouter.get("/auth/login", authController.getLogin);
authRouter.post("/auth/login", authController.postLogin);
authRouter.post("/auth/logout", authController.postLogout);
authRouter.get("/auth/signup", authController.getSignup);
authRouter.post("/auth/signup", authController.postSignup);

module.exports = authRouter;
