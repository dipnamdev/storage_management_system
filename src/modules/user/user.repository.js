const pool = require("../../config/db");

const createUser = async (data, userId) => {
    const query = `
    INSERT INTO user (
     full_name, email_id, phone_number, hashed_password, role, created_by
    ) values (?,?,?,?,?,?)
  `;

    const values = [
        data.full_name,
        data.email_id,
        data.phone_number,
        data.hashed_password ,
        data.role,
        data.created_by,
    ];

    const [result] = await pool.query(query, values);
    return result;
};

const getUserByEmail = async(email)=>{
  const query =`
    SELECT * FROM user WHERE email_id=?
  `
  const [result] = await pool.query(query, email)
  return result[0];
}

export {createUser, getUserByEmail};