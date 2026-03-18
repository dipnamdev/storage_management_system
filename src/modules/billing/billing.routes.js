import express from "express";
import billingController from "./billing.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/role.middleware.js";

const router = express.Router();

/*
==================================================
WAREHOUSE MANAGER ROUTES
==================================================
*/

/**
 * Create Billing
 * Manager creates new billing request
 */
router.post(
  "/add",
  verifyToken,
  roleMiddleware("WAREHOUSE_MANAGER"),
  billingController.createBilling
);

/**
 * Edit Billing
 * Creates new billing version (needs admin approval)
 */
router.put(
  "/:billingId",
  verifyToken,
  roleMiddleware("WAREHOUSE_MANAGER"),
  billingController.editBilling
);

/**
 * Get Manager Billing
 * Manager sees only his warehouse billing
 */
router.get(
  "/my",
  verifyToken,
  roleMiddleware("WAREHOUSE_MANAGER"),
  billingController.getManagerBilling
);

/**
 * Get Single Billing Details
 */
router.get(
  "/:billingId",
  verifyToken,
  billingController.getBillingDetails
);



/*
==================================================
ADMIN ROUTES
==================================================
*/

/**
 * Get All Billing
 * Admin dashboard
 */
router.get(
  "/",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  billingController.getAllBilling
);

/**
 * Approve Billing
 */
router.patch(
  "/approve/:billingId",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  billingController.approveBilling
);

/**
 * Approve Edited Billing Version
 */
router.patch(
  "/approve-edit/:billingId/:versionId",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  billingController.approveEdit
);

/**
 * Reject Billing
 */
router.patch(
  "/reject/:billingId",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  billingController.rejectBilling
);

/**
 * Reject Edited Billing Version
 */
router.patch(
  "/reject-edit/:billingId/:versionId",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  billingController.rejectBilling
);

/**
 * Pass Payment
 */
router.post(
  "/payment/:billingId",
  verifyToken,
  roleMiddleware("SUPER_ADMIN"),
  billingController.passPayment
);

export default router;