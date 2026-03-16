import userService from "./user.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createUser = async (req, res) => {
    try {
        const { password, ...rest } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await userService.registerUser({ 
            ...rest, 
            password_hash: hashedPassword
        });

        res.status(201).json({ message: "User created", userId: result.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const user = await userService.getUserByEmail(req.body.email_id);
        if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role, email_id: user.email_id }, 
            process.env.JWT_SECRET || "fallback_secret", 
            { expiresIn: "1d" }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: { id: user.id, role: user.role } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { createUser, getUserById, updateUser, deleteUser, login };