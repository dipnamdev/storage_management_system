import express from "express";
import user from "./modules/user/user.routes.js";
import warehouse from "./modules/warehouse/warehouse.routes.js";
import commodity from "./modules/commodity/commodity.routes.js";
import billing from "./modules/billing/billing.routes.js";

const router = express.Router();

router.use("/user", user);
router.use("/warehouse", warehouse);
router.use("/commodity", commodity);
router.use("/billing", billing)

export default router;