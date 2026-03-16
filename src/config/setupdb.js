// import logger from './logger' ;
import {pool} from "./db.js";
import bcrypt from "bcrypt";

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Setting up database...");

    // await client.query("BEGIN");

    // =========================
    // USERS
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email_id VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN','WAREHOUSE_MANAGER')),
        warehouse_number VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // =========================
    // WAREHOUSES
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id SERIAL PRIMARY KEY,
        district_name VARCHAR(255) NOT NULL,
        branch_name VARCHAR(255) NOT NULL,
        warehouse_name VARCHAR(255) NOT NULL,
        warehouse_number VARCHAR(100) UNIQUE NOT NULL,
        warehouse_owner VARCHAR(255),
        gst_number VARCHAR(100),
        pan_number VARCHAR(100),
        pancard_holder VARCHAR(255),
        sr_no VARCHAR(100),
        deposit_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // add warehouse FK to users
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_warehouse
      FOREIGN KEY (warehouse_id)
      REFERENCES warehouses(id)
      ON DELETE SET NULL;
    `).catch(()=>{});

    // =========================
    // COMMODITIES
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS commodities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // =========================
    // COMMODITY PRICES
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS commodity_prices (
        id SERIAL PRIMARY KEY,
        commodity_id INTEGER NOT NULL,
        financial_year VARCHAR(7) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        last_edited_by INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_price_commodity
        FOREIGN KEY (commodity_id)
        REFERENCES commodities(id)
        ON DELETE CASCADE,

        CONSTRAINT fk_price_user
        FOREIGN KEY (last_edited_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

        UNIQUE(commodity_id, financial_year)
      );
    `);

    // =========================
    // CLAIMS (HEADER)
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        warehouse_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        current_version_id INTEGER,
        status VARCHAR(30) NOT NULL CHECK (
          status IN ('PENDING_APPROVAL','APPROVED','REJECTED','PAID')
        ),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_claim_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id),

        CONSTRAINT fk_claim_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
      );
    `);

    // =========================
    // CLAIM VERSIONS
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS claim_versions (
        id SERIAL PRIMARY KEY,
        claim_id INTEGER NOT NULL,
        version_number INTEGER NOT NULL,

        depositor_name VARCHAR(255),
        depositor_gst VARCHAR(50),

        commodity_id INTEGER NOT NULL,
        bill_no VARCHAR(100),
        claim_month INTEGER,
        financial_year VARCHAR(7),

        taxable_amount DECIMAL(12,2),
        tax_amount DECIMAL(12,2),
        total_amount DECIMAL(12,2),

        payment_mode VARCHAR(20),
        instrument_no VARCHAR(100),

        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_version_claim
        FOREIGN KEY (claim_id)
        REFERENCES claims(id)
        ON DELETE CASCADE,

        CONSTRAINT fk_version_commodity
        FOREIGN KEY (commodity_id)
        REFERENCES commodities(id),

        CONSTRAINT fk_version_user
        FOREIGN KEY (created_by)
        REFERENCES users(id),

        UNIQUE(claim_id, version_number)
      );
    `);

    // add pointer to current version
    await client.query(`
      ALTER TABLE claims
      ADD CONSTRAINT fk_claim_current_version
      FOREIGN KEY (current_version_id)
      REFERENCES claim_versions(id)
      ON DELETE SET NULL;
    `).catch(()=>{});

    // =========================
    // CLAIM APPROVALS
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS claim_approvals (
        id SERIAL PRIMARY KEY,
        claim_id INTEGER NOT NULL,
        version_id INTEGER NOT NULL,

        action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVED','REJECTED')),
        remarks TEXT,

        action_by INTEGER NOT NULL,
        action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_approval_claim
        FOREIGN KEY (claim_id)
        REFERENCES claims(id)
        ON DELETE CASCADE,

        CONSTRAINT fk_approval_version
        FOREIGN KEY (version_id)
        REFERENCES claim_versions(id)
        ON DELETE CASCADE,

        CONSTRAINT fk_approval_user
        FOREIGN KEY (action_by)
        REFERENCES users(id)
      );
    `);

    // =========================
    // CLAIM PAYMENTS
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS claim_payments (
        id SERIAL PRIMARY KEY,
        claim_id INTEGER UNIQUE NOT NULL,

        approved_amount DECIMAL(12,2) NOT NULL,

        advice_no VARCHAR(100),
        advice_date DATE,
        payment_date DATE,

        remarks TEXT,

        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_payment_claim
        FOREIGN KEY (claim_id)
        REFERENCES claims(id)
        ON DELETE CASCADE,

        CONSTRAINT fk_payment_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
      );
    `);

    // =========================
    // DUMMY DATA SEEDING
    // =========================
    console.log("🌱 Seeding default user and dummy data...");

    // 1. Default Admin User
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("admin123", salt);

    await client.query(`
      INSERT INTO users (first_name, last_name, email_id, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email_id) DO NOTHING;
    `, ["Super", "Admin", "admin@storage.com", adminPasswordHash, "SUPER_ADMIN"]);

    // 2. Dummy Warehouse
    await client.query(`
      INSERT INTO warehouses (district_name, branch_name, warehouse_name, warehouse_number, gst_number, pan_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (warehouse_number) DO NOTHING;
    `, ["New Delhi", "Central Branch", "Central Storage Facility", "WH-001", "07AAAAA0000A1Z5", "AAAAA0000A"]);

    // 3. Dummy Warehouse Manager User
    const managerPasswordHash = await bcrypt.hash("manager123", salt);
    await client.query(`
      INSERT INTO users (first_name, last_name, email_id, password_hash, role, warehouse_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email_id) DO NOTHING;
    `, ["Warehouse", "Manager1", "manager1@storage.com", managerPasswordHash, "WAREHOUSE_MANAGER", "WH-001"]);

    // 4. Dummy Commodity & Price
    await client.query(`
      INSERT INTO commodities (name, is_active)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING;
    `, ["Wheat", true]);

    await client.query(`
      INSERT INTO commodity_prices (commodity_id, financial_year, price_per_unit)
      SELECT id, $1, $2 FROM commodities WHERE name = $3
      ON CONFLICT (commodity_id, financial_year) DO NOTHING;
    `, ["2023-24", 25.50, "Wheat"]);


    // await client.query("COMMIT");

    console.log("✅ Database setup completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("RAW ERROR =>", err.message, "| Code:", err.code, "| Detail:", err.detail);
    throw err;
  } finally {
    client.release();
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    process.exit(1);
  });