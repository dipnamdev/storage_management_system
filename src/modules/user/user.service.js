import { pool } from "../../config/db.js";

const registerUser = async (data) => {
    // Role validation
    const validRoles = ['SUPER_ADMIN', 'WAREHOUSE_MANAGER'];
    if (!validRoles.includes(data.role)) {
        throw new Error("Invalid role. Must be 'SUPER_ADMIN' or 'WAREHOUSE_MANAGER'");
    }

    const query = `
    INSERT INTO users (first_name, last_name, email_id, password_hash, role) 
    VALUES ($1, $2, $3, $4, $5) RETURNING id`;

    const values = [data.first_name, data.last_name, data.email_id, data.password_hash, data.role];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getUserByEmail = async (email_id) => {
    const result = await pool.query("SELECT * FROM users WHERE email_id = $1", [email_id]);
    return result.rows[0];
};

const getUserById = async (id) => {
    const result = await pool.query("SELECT id, first_name, last_name, email_id, role, warehouse_number, warehouse_id FROM users WHERE id = $1", [id]);
    return result.rows[0];
};

const updateUser = async (id, data) => {
    // Prevent role spoofing if role is passed
    if (data.role && !['SUPER_ADMIN', 'WAREHOUSE_MANAGER'].includes(data.role)) {
        throw new Error("Invalid role selection");
    }

    const query = `
    UPDATE users SET first_name = $1, last_name = $2, role = $3
    WHERE id = $4 RETURNING *`;
    
    const result = await pool.query(query, [data.first_name, data.last_name, data.role, id]);
    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return result.rows[0];
};

const userService = { registerUser, getUserByEmail, getUserById, updateUser, deleteUser };
export default userService;