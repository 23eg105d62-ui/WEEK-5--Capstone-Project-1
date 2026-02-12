import exp from 'express'
import bcrypt from "bcryptjs";
import { authenticate } from '../Services/AuthService.js';
import UserModel from "../Models/UserModel.js";
import { verifyToken } from "../Middlewares/verifyToken.js";

export const commonRouter = exp.Router()

//login
commonRouter.post("/login", async (req, res) => {
     //get user cred object
      let userCred = req.body;

      //call authenticate service
      let { token, user } = await authenticate(userCred);

      //save token as httpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      //send res
      res.status(200).json({ message: "login success", payload: user });
})


//logout
//logout for User, Author and Admin
commonRouter.get('/logout', (req, res) => {
  // Clear the cookie named 'token'
  res.clearCookie('token', {
    httpOnly: true, 
    secure: false,   
    sameSite: 'lax' 
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
});


// change the password
commonRouter.put("/change-password", verifyToken, async (req, res) => {

    // get userId from token
    const userId = req.user.userId;

    const currPass = req.body.currentPassword;
    const newPass = req.body.newPassword;

    // Check if new password same as old
    if (currPass === newPass) {
      return res.status(400).json({ 
        message: "New password must be different from current password" 
      });
    }

    // Find user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(currPass, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPass, 10);

    // Update password in DB
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
});
