import express from "express";
import userController from "./user.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/role.middleware.js";

const router = express.Router();

// Public
router.post("/login", userController.login);
router.post("/register", userController.createUser);

// Protected
router.get("/:id", verifyToken, userController.getUserById);
router.put("/update/:id", verifyToken, userController.updateUser);
router.delete("/delete/:id", verifyToken, roleMiddleware("SUPER_ADMIN"), userController.deleteUser);

export default router;