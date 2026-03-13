// import userService from "./user.service.js";

// import bcrypt from "bcrypt";

// const createUser = async (req, res) => {
//     try {
//         // hash the plain‑text password before saving
//         const { password, ...rest } = req.body;
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // pass the hashed password to the service
//         const result = await userService.createUser(
//             { ...rest, hashed_password: hashedPassword },
//             req.user.id
//         );

//         res.status(201).json({
//             message: "User created successfully",
//             userId: result.insertId,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Error creating user",
//             error: error.message,
//         });
//     }
// };

// const getUserById = async (req, res)=>{
//     try{
//         const result = await userService.getUserById(req.params.id);
        
//         res.status(200).json({
//             message:"User retrieved successfully",
//             user:result
//         })
        
//     }
//     catch(error){
//         res.status(500).json({
//             message:"Error retrieving User",
//             error:error.message
//         })
//     }
// }

// const updateUser = async (req,res) => {
//     try{
//         const result = await userService.updateUser(req.params.id, req.body);
//         res.status(200).json({
//             message: "User Details Updated Successfully",
//             user:result
//         })
//     }
//     catch(error){
//         res.status(500).json({
//             message: "Error updating user details",
//             error: error.message
//         })
//     }
// }

// // ----------------------------------------------------------------
// // authentication helpers

// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await userService.getUserByEmail(email);
//         if (!user) {
//             return res.status(400).json({ message: "Wrong Username/Password" });
//         }

//         const passwordMatches = await bcrypt.compare(password, user.hashed_password || user.hased_password);
//         if (!passwordMatches) {
//             return res.status(400).json({ message: "Wrong Username/Password" });
//         }

//         // generate JWT or whatever you use for sessions
//         const token = userService.generateToken(user);
//         res.status(200).json({ token });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // alias createUser so routes can call it as `register`


// export { createUser, getUserById, login };

// // default export for existing code that was expecting a default
// export default { createUser, getUserById, login };