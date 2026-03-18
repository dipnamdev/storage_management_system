import { pool } from "../../config/db.js";
import bcrypt from "bcrypt";

const createWarehouseWithManager = async (warehouseData, managerData) => {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        // 1. Insert Warehouse
        const warehouseQuery = `
            INSERT INTO warehouses (district_name, branch_name, warehouse_name, warehouse_number, gst_number, pan_number, pancard_holder, sr_no, deposit_name, warehouse_owner)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )
            RETURNING id, warehouse_number
        `;
        const warehouseValues = [
            warehouseData.district_name, 
            warehouseData.branch_name, 
            warehouseData.warehouse_name, 
            warehouseData.warehouse_number, 
            warehouseData.gst_number, 
            warehouseData.pan_number,
            warehouseData.pancard_holder,
            warehouseData.sr_no,
            warehouseData.deposit_name,
            warehouseData.warehouse_owner
        ];
        
        const warehouseResult = await client.query(warehouseQuery, warehouseValues);
        const newWarehouse = warehouseResult.rows[0];

        // 2. Insert Warehouse Manager
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(managerData.password, salt);

        const managerQuery = `
            INSERT INTO users (first_name, last_name, email_id, password_hash, role, warehouse_number, warehouse_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, first_name, last_name, email_id, role, warehouse_number, warehouse_id  `;
        const managerValues = [
            managerData.first_name,
            managerData.last_name,
            managerData.email_id || managerData.email,
            hashedPassword,
            'WAREHOUSE_MANAGER',
            newWarehouse.warehouse_number,
            newWarehouse.id
        ];

        const managerResult = await client.query(managerQuery, managerValues);
        const newManager = managerResult.rows[0];

        await client.query("COMMIT");

        return {
            warehouse: newWarehouse,
            manager: newManager
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getAllWarehouse = async () => {
    try {
        const query = `
            SELECT 
                w.id, w.district_name, w.branch_name, w.warehouse_name, w.warehouse_number, w.gst_number, w.pan_number,
                w.pancard_holder, w.sr_no, w.deposit_name, w.warehouse_owner,
                u.first_name AS manager_first_name, u.last_name AS manager_last_name, u.email_id AS manager_email
            FROM warehouses w
            LEFT JOIN users u ON w.warehouse_number = u.warehouse_number AND u.role = 'WAREHOUSE_MANAGER'
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

const updateWarehouse = async (id, warehouseData) => {
    const query = `
        UPDATE warehouses 
        SET district_name = $1, branch_name = $2, warehouse_name = $3, warehouse_number = $4, 
            gst_number = $5, pan_number = $6, pancard_holder = $7, sr_no = $8, 
            deposit_name = $9, warehouse_owner = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
    `;
    const values = [
        warehouseData.district_name,
        warehouseData.branch_name,
        warehouseData.warehouse_name,
        warehouseData.warehouse_number,
        warehouseData.gst_number,
        warehouseData.pan_number,
        warehouseData.pancard_holder,
        warehouseData.sr_no,
        warehouseData.deposit_name,
        warehouseData.warehouse_owner,
        id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteWarehouse = async (id) => {
    const query = `DELETE FROM warehouses WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getWarehouseById = async (id) => {
    try {
        const query = `
            SELECT 
                w.*,
                u.first_name AS manager_first_name, u.last_name AS manager_last_name, u.email_id AS manager_email
            FROM warehouses w
            LEFT JOIN users u ON w.warehouse_number = u.warehouse_number AND u.role = 'WAREHOUSE_MANAGER'
            WHERE w.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export default { createWarehouseWithManager, getAllWarehouse, updateWarehouse, deleteWarehouse, getWarehouseById };
