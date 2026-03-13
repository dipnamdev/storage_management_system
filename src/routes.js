import express from "express";
import user from "./modules/user/user.routes.js"

const router = express.Router();

router.use("/user", user);


export default router;