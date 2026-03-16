import express from "express";
import warehouseController from "./warehouse.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/role.middleware.js";

const router = express.Router();

router.post("/create", verifyToken, roleMiddleware("SUPER_ADMIN"), warehouseController.createWarehouse);
router.get("/", verifyToken, warehouseController.getAllWarehouse);
router.get("/:id", verifyToken, warehouseController.getWarehouseById);
router.put("/update/:id", verifyToken, roleMiddleware("SUPER_ADMIN"), warehouseController.updateWarehouse);
router.delete("/delete/:id", verifyToken, roleMiddleware("SUPER_ADMIN"), warehouseController.deleteWarehouse);
export default router;
