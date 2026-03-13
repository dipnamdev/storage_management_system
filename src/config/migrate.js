// const { Pool } = require('pg');
// require('dotenv').config();

// const ensureDatabaseExists = require('./ensureDatabase');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//    options: "-c search_path=public"

// });



// const migration = `
// -- Create users table if it doesn't exist

// CREATE TABLE IF NOT EXISTS users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password_hash VARCHAR(255) NOT NULL,
//     first_name VARCHAR(255) NOT NULL,
//     last_name VARCHAR(255) NOT NULL,
//     role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'WAREHOUSE_MANAGER')),
//     profile_picture_url TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// );

// CREATE TABLE IF NOT EXISTS warehouses (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     warehouse_name VARCHAR(255) NOT NULL,
//     warehouse_number VARCHAR(100) UNIQUE NOT NULL,
//     district_name VARCHAR(255) NOT NULL,
//     branch_name VARCHAR(255) NOT NULL,
//     gst_number VARCHAR(100) NOT NULL,
//     pan_number VARCHAR(100) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     warehouse_manager UUID REFERENCES users(id),
//     created_by UUID REFERENCES users(id),
//     );
// `;

// async function runMigration() {
//   await ensureDatabaseExists(process.env.DATABASE_URL);
//   const client = await pool.connect();
//   try {
//     console.log('Starting database migration...');
//     await client.query(migration);
//     console.log('✅ Database migration completed successfully!');
//     console.log('✅ All tables and indexes created.');
//   } catch (error) {
//     console.error('❌ Migration failed:', error.message);
//     throw error;
//   } finally {
//     client.release();
//     await pool.end();
//   }
// }

// if (require.main === module) {
//   runMigration();
// }

// module.exports = runMigration;
