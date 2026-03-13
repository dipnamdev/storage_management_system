import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import { connectToDB } from "./src/config/db.js";


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})

await connectToDB();