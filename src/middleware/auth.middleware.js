// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// // import User from "../models/user.model.js";

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; 
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };


// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({ message: "User created" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };




// module.exports = verifyToken;