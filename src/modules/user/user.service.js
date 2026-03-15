import { pool } from "../../config/db.js";

const registerUser = async (data) => {
    // Role validation
    const validRoles = ['admin', 'warehouse_manager'];
    if (!validRoles.includes(data.role)) {
        throw new Error("Invalid role. Must be 'admin' or 'warehouse_manager'");
    }

    const query = `
    INSERT INTO users (full_name, email_id, phone_number, hashed_password, role, created_by) 
    VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [data.full_name, data.email_id, data.phone_number, data.hashed_password, data.role, data.created_by];
    const [result] = await pool.query(query, values);
    return result;
};

const getUserByEmail = async (email) => {
    const [result] = await pool.query("SELECT * FROM user WHERE email_id = ?", [email]);
    return result[0];
};

const getUserById = async (id) => {
    const [result] = await pool.query("SELECT id, full_name, email_id, phone_number, role FROM user WHERE id = ?", [id]);
    return result[0];
};

const updateUser = async (id, data) => {
    // Prevent role spoofing if role is passed
    if (data.role && !['admin', 'warehouse_manager'].includes(data.role)) {
        throw new Error("Invalid role selection");
    }

    const query = `
    UPDATE user SET full_name = ?, phone_number = ?, role = ?
    WHERE id = ?`;
    
    const [result] = await pool.query(query, [data.full_name, data.phone_number, data.role, id]);
    return result;
};

const deleteUser = async (id) => {
    const [result] = await pool.query("DELETE FROM user WHERE id = ?", [id]);
    return result;
};

const userService = { registerUser, getUserByEmail, getUserById, updateUser, deleteUser };
export default userService;