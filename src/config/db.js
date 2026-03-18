import { Pool } from "pg";

// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   user: "postgres",
//   password: "1234",
//   database: "storage_management_system"
// })

const pool = new Pool({
  connectionString: "postgresql://postgres:Roopesh@1905@db.qnztgwhjkwbylwrwcqss.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

const connectToDB = async () => {
  console.log(process.env.DB_USER)
  console.log(process.env.DB_PASSWORD)

  console.log("Starting......")
  try {
    await pool.connect()
    console.log("Database Connected successfully")
  }
  catch (error) {
    console.log("Db Connection Failed", error)
  }
}
export { connectToDB, pool };