import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
});

const connectToDB=async()=>{
  console.log(process.env.DB_PASSWORD)
    await pool.connect()
    .then(console.log("Database Connected successfully"))
    .catch(error=>{
      console.log("Db Connection Failed",error)
    })
}
export {connectToDB, pool}

