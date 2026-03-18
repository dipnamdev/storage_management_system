import { pool } from "./src/config/db.js";

async function checkWarehouses() {
    try {
        const res = await pool.query("SELECT * FROM warehouses LIMIT 5");
        console.log("Warehouses data:", JSON.stringify(res.rows, null, 2));

        const billingRes = await pool.query(`
            SELECT b.id, w.warehouse_name, w.branch_name, w.district_name 
            FROM warehouse_billing b 
            JOIN warehouses w ON w.id = b.warehouse_id 
            LIMIT 5
        `);
        console.log("Joint Billing data:", JSON.stringify(billingRes.rows, null, 2));

    } catch (err) {
        console.error("Check failed:", err.message);
    } finally {
        process.exit();
    }
}

checkWarehouses();
