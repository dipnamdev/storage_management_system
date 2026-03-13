import logger from './logger' ;
import pool from "./db.js";

async function setupDatabase() {
  const client = await pool.connect();

  try {
    logger.info("🚀 Setting up database...");

    await client.query("BEGIN");

    // =========================
    // USERS
    // =========================
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN','WAREHOUSE_MANAGER')),
        warehouse_id INTEGER,
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
        branch_name VARCHAR(255),
        warehouse_name VARCHAR(255) NOT NULL,
        warehouse_number VARCHAR(100) UNIQUE NOT NULL,
        gst_number VARCHAR(100),
        pan_number VARCHAR(100),
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

    await client.query("COMMIT");

    logger.info("✅ Database setup completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Setup failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

setupDatabase();