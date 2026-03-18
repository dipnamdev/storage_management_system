import { pool } from "./src/config/db.js";

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'warehouse_id'
        `);
        console.log("Column check for warehouse_id in users:", res.rows);

        const manager = await pool.query("SELECT email_id, warehouse_id FROM users WHERE email_id = 'manager1@storage.com'");
        console.log("Manager dummy record:", manager.rows);

    } catch (err) {
        console.error("Check failed:", err.message);
    } finally {
        process.exit();
    }
}

checkSchema();
