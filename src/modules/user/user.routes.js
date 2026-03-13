import express from "express";
import userController from "./user.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

// public routes
router.post("/login", userController.login);
router.post("/register", userController.createUser);

// everything under here requires a valid token
router.use(authMiddleware);

router.get("/", (req, res) => {
  res.json({ message: "User route working" });
});

export default router;