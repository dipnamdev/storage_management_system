import express from "express";
import userController from "./user.controller.js";

const router = express.Router();

// Public
router.post("/login", userController.login);
router.post("/register", userController.createUser);

// Protected (Assumes authMiddleware is implemented)
router.get("/:id", userController.getUserById);
router.put("/update/:id", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);

export default router;