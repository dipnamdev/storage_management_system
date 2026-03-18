import billingService from "./billing.service.js";

const createBilling = async (req, res) => {
  try {
    const userId = req.user.id;
    const warehouseId = req.user.warehouse_id;

    if (!warehouseId) {
      return res.status(403).json({ 
        error: "Your profile is not associated with any warehouse. Please log out and log back in, or contact Admin." 
      });
    }

    const data = req.body;

    const result = await billingService.createBilling(
      warehouseId,
      userId,
      data
    );

    res.status(201).json({
      message: "Billing created successfully",
      data: result
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const editBilling = async (req, res) => {
  try {
    const billingId = req.params.billingId;
    const userId = req.user.id;
    const data = req.body;

    const result = await billingService.editBilling(
      billingId,
      userId,
      data
    );

    res.json({
      message: "Billing edited and sent for approval",
      data: result,
      versionId: result.version
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getManagerBilling = async (req, res) => {
  try {

    const warehouseId = req.user.warehouse_id;

    if (!warehouseId) {
       return res.status(403).json({ 
        error: "Your profile is not associated with any warehouse. Please log out and log back in, or contact Admin." 
      });
    }

    const result = await billingService.getManagerBilling(warehouseId);

    res.json({ data: result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllBilling = async (req, res) => {
  try {

    const filters = req.query;

    const result = await billingService.getAllBilling(filters);

    res.json({ data: result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBillingDetails = async (req, res) => {
  try {

    const billingId = req.params.billingId;

    const result = await billingService.getBillingDetails(billingId);

    res.json({ data: result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const approveBilling = async (req, res) => {
  try {

    const billingId = req.params.billingId;
    const adminId = req.user.id;

    const result = await billingService.approveBilling(billingId, adminId);

    res.json({
      message: "Billing approved",
      data: result
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const approveEdit = async (req, res) => {
  try {
    const billingId = req.params.billingId;
    const versionId = req.params.versionId;

    const result = await billingService.approveEdit(billingId, versionId);

    res.json({
      message: "Edit approved successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const rejectBilling = async (req, res) => {
  try {

    const billingId = req.params.billingId;
    const adminId = req.user.id;
    const versionId = req.params.versionId; // optional

    const result = await billingService.rejectBilling(billingId, adminId, versionId);

    res.json({
      message: versionId ? "Edit rejected" : "Billing rejected",
      data: result
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const passPayment = async (req, res) => {
  try {

    const billingId = req.params.billingId;
    const adminId = req.user.id;
    const paymentData = req.body;

    const result = await billingService.passPayment(
      billingId,
      adminId,
      paymentData
    );

    res.json({
      message: "Payment recorded",
      data: result
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export default {
  createBilling,
  editBilling,
  getManagerBilling,
  getAllBilling,
  getBillingDetails,
  approveBilling,
  approveEdit,
  rejectBilling,
  passPayment
};