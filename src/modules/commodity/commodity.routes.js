import express from "express";
import commodityController from "./commodity.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/add",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  commodityController.createCommodity
);

router.get("/",commodityController.getAllCommodity);

router.put(
  "/:id",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  commodityController.updateCommodity
);

router.delete(
  "/:id",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  commodityController.deleteCommodity
);

export default router;