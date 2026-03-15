import bcrypt from "bcrypt";

 const salt = await bcrypt.genSalt(10);
const password = "AdminPassword";
const hashedPassword = await bcrypt.hash(password, salt);
console.log(hashedPassword);