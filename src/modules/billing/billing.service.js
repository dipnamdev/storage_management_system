import { pool } from "../../config/db.js";

const createBilling = async (warehouseId, userId, data) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const billingResult = await client.query(
      `
      INSERT INTO warehouse_billing
      (warehouse_id, created_by, inbound_time, outbound_time, status)
      VALUES ($1,$2,$3,$4,'PENDING_APPROVAL')
      RETURNING id
      `,
      [
        warehouseId,
        userId,
        data.inbound_time,
        data.outbound_time
      ]
    );

    const billingId = billingResult.rows[0].id;

    const taxableAmount = parseFloat(data.taxable_amount) || 0;
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const totalAmount = taxableAmount + cgst + sgst;

    const versionResult = await client.query(
      `
      INSERT INTO warehouse_billing_versions
      (
        billing_id,
        version_number,
        depositor_name,
        depositor_gst,
        commodity_id,
        bill_no,
        claim_month,
        financial_year,
        taxable_amount,
        sgst,
        cgst,
        total_amount,
        created_by
      )
      VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
      `,
      [
        billingId,
        data.depositor_name,
        data.depositor_gst,
        data.commodity_id,
        data.bill_no,
        data.claim_month,
        data.financial_year,
        taxableAmount,
        sgst,
        cgst,
        totalAmount,
        userId
      ]
    );

    const versionId = versionResult.rows[0].id;

    await client.query(
      `
      UPDATE warehouse_billing
      SET current_version_id=$1
      WHERE id=$2
      `,
      [versionId, billingId]
    );

    await client.query("COMMIT");

    return { billingId, versionId };

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
};



const editBilling = async (billingId, userId, data) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    // Check if the bill can be edited
    const billingStatusResult = await client.query(
      `SELECT status FROM warehouse_billing WHERE id=$1`,
      [billingId]
    );
    
    if (billingStatusResult.rowCount === 0) {
      throw new Error(`Billing record not found for ID: ${billingId}`);
    }

    const currentStatus = billingStatusResult.rows[0].status;
    if (currentStatus === 'APPROVED' || currentStatus === 'PAID') {
      throw new Error("Cannot edit an approved or paid bill.");
    }

    const versionResult = await client.query(
      `
      SELECT MAX(version_number) as max_version
      FROM warehouse_billing_versions
      WHERE billing_id=$1
      `,
      [billingId]
    );

    const newVersion = (versionResult.rows[0].max_version || 0) + 1;

    const taxableAmount = parseFloat(data.taxable_amount) || 0;
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const totalAmount = taxableAmount + cgst + sgst;

    const newVersionResult = await client.query(
      `
      INSERT INTO warehouse_billing_versions
      (
        billing_id,
        version_number,
        depositor_name,
        depositor_gst,
        commodity_id,
        bill_no,
        claim_month,
        financial_year,
        taxable_amount,
        sgst,
        cgst,
        total_amount,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id
      `,
      [
        billingId,
        newVersion,
        data.depositor_name,
        data.depositor_gst,
        data.commodity_id,
        data.bill_no,
        data.claim_month,
        data.financial_year,
        taxableAmount,
        sgst,
        cgst,
        totalAmount,
        userId
      ]
    );

    await client.query(
      `
      UPDATE warehouse_billing
      SET status='PENDING_APPROVAL'
      WHERE id=$1
      `,
      [billingId]
    );

    await client.query("COMMIT");

    return { billingId, version: newVersion };

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
};



const getManagerBilling = async (warehouseId) => {
  const result = await pool.query(
    `
    SELECT
    b.id,
    b.status,
    b.inbound_time,
    b.outbound_time,
    w.district_name,
    w.branch_name,
    w.warehouse_name,
    c.name as commodity_name,
    bv.depositor_name,
    bv.bill_no,
    bv.total_amount,
    bp.amount_passed,
    bp.payment_mode,
    bp.instrument_no,
    bp.payment_date,
    bp.advice_no,
    bp.advice_date,
    bp.remarks as payment_remarks
    FROM warehouse_billing b
    JOIN warehouses w ON w.id = b.warehouse_id
    JOIN warehouse_billing_versions bv ON bv.id = b.current_version_id
    LEFT JOIN commodities c ON c.id = bv.commodity_id
    LEFT JOIN billing_payments bp ON bp.billing_id = b.id
    WHERE b.warehouse_id = $1
    ORDER BY b.created_at DESC
    `,
    [warehouseId]
  );

  return result.rows;
};



const getAllBilling = async (filters) => {

  let query = `
  SELECT
  b.id,
  w.warehouse_name,
  w.district_name,
  b.status,
  bv.depositor_name,
  bv.total_amount
  FROM warehouse_billing b
  JOIN warehouses w ON w.id=b.warehouse_id
  JOIN warehouse_billing_versions bv ON bv.id=b.current_version_id
  WHERE 1=1
  `;

  const values = [];
  let index = 1;

  if (filters.district) {
    query += ` AND w.district_name=$${index++}`;
    values.push(filters.district);
  }

  if (filters.status) {
    query += ` AND b.status=$${index++}`;
    values.push(filters.status);
  }

  query += ` ORDER BY b.created_at DESC`;

  const result = await pool.query(query, values);

  return result.rows;
};



const getBillingDetails = async (billingId) => {

  const result = await pool.query(
    `
    SELECT
    b.id,
    b.warehouse_id,
    b.status,
    b.inbound_time,
    b.outbound_time,
    b.created_at as billing_created_at,
    w.warehouse_name,
    w.warehouse_number,
    w.branch_name,
    w.district_name,
    w.pan_number,
    w.gst_number as warehouse_gst,
    c.name as commodity_name,
    bv.id as version_id,
    bv.depositor_name,
    bv.depositor_gst,
    bv.bill_no,
    bv.claim_month,
    bv.financial_year,
    bv.taxable_amount,
    bv.sgst,
    bv.cgst,
    bv.total_amount,
    bp.amount_passed,
    bp.payment_mode,
    bp.instrument_no,
    bp.payment_date,
    bp.advice_no,
    bp.advice_date,
    bp.remarks as payment_remarks
    FROM warehouse_billing b
    JOIN warehouses w ON w.id=b.warehouse_id
    JOIN warehouse_billing_versions bv ON bv.id=b.current_version_id
    LEFT JOIN commodities c ON c.id = bv.commodity_id
    LEFT JOIN billing_payments bp ON bp.billing_id=b.id
    WHERE b.id=$1
    `,
    [billingId]
  );

  return result.rows[0];
};



const approveBilling = async (billingId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Approve the main bill
    await client.query(
      `
      UPDATE warehouse_billing
      SET status='APPROVED'
      WHERE id=$1
      `,
      [billingId]
    );

    // Get the current version to approve it as well
    const billingRes = await client.query(
      `SELECT current_version_id FROM warehouse_billing WHERE id=$1`,
      [billingId]
    );
    const currentVersionId = billingRes.rows[0].current_version_id;

    if (currentVersionId) {
      await client.query(
        `
        UPDATE warehouse_billing_versions
        SET version_status='APPROVED'
        WHERE id=$1
        `,
        [currentVersionId]
      );
    }

    await client.query("COMMIT");
    return { billingId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const approveEdit = async (billingId, versionId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Set the version status to approved
    await client.query(
      `
      UPDATE warehouse_billing_versions
      SET version_status='APPROVED'
      WHERE id=$1 AND billing_id=$2
      `,
      [versionId, billingId]
    );

    // Update the current version to this newly approved version
    await client.query(
      `
      UPDATE warehouse_billing
      SET current_version_id=$1, status='PENDING_APPROVAL' 
      WHERE id=$2
      `,
      [versionId, billingId]
    );

    await client.query("COMMIT");
    return { billingId, versionId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};



const rejectBilling = async (billingId, adminId, versionId = null) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (versionId) {
      // Reject a specific proposed edit
      await client.query(
        `
        UPDATE warehouse_billing_versions
        SET version_status='REJECTED'
        WHERE id=$1 AND billing_id=$2
        `,
        [versionId, billingId]
      );
    } else {
      // Reject the entire bill
      await client.query(
        `
        UPDATE warehouse_billing
        SET status='REJECTED'
        WHERE id=$1
        `,
        [billingId]
      );

      // Also mark the current version as rejected
      const billingRes = await client.query(
        `SELECT current_version_id FROM warehouse_billing WHERE id=$1`,
        [billingId]
      );
      const currentVersionId = billingRes.rows[0]?.current_version_id;

      if (currentVersionId) {
        await client.query(
          `
          UPDATE warehouse_billing_versions
          SET version_status='REJECTED'
          WHERE id=$1
          `,
          [currentVersionId]
        );
      }
    }

    await client.query("COMMIT");
    return { billingId, versionId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};



const passPayment = async (billingId, adminId, data) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    await client.query(
      `
      INSERT INTO billing_payments
      (
        billing_id,
        amount_passed,
        payment_mode,
        instrument_no,
        payment_date,
        advice_no,
        advice_date,
        remarks,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        billingId,
        data.amount_passed,
        data.payment_mode,
        data.instrument_no,
        data.payment_date,
        data.advice_no,
        data.advice_date,
        data.remarks,
        adminId
      ]
    );

    await client.query(
      `
      UPDATE warehouse_billing
      SET status='PAID'
      WHERE id=$1
      `,
      [billingId]
    );

    await client.query("COMMIT");

    return { billingId };

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
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