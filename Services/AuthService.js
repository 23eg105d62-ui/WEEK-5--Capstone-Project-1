import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../Models/UserModel.js";
import { config } from 'dotenv'
config()

//register function
export const register = async (userObj) => {
  //Create document
  const userDoc = new UserModel(userObj);
  //validate for empty passwords
  await userDoc.validate();
  //hash and replace plain password
  userDoc.password = await bcrypt.hash(userDoc.password, 10);
  //save
  const created = await userDoc.save();
  //convert document to object to remove password
  const newUserObj = created.toObject();
  //remove password
  delete newUserObj.password;
  //return user obj without password
  return newUserObj;
};

//authenticate function
export const authenticate = async ({ email, password, role }) => {
  const newRole = role ? { email, role } : { email };

  //check user with email (and role if provided)
  const user = await UserModel.findOne(newRole);
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  //if user valid ,but blocked by admin

  // isActive state
  if (user.isActive === false) {
    const err = new Error("Your account is blocked. Please contact Admin")
    err.status = 403
    throw err;
  }

  //compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid password");
    err.status = 401;
    throw err;
  }

  //generate token
  const token = jwt.sign({
    userId: user._id,
    role: user.role, email: user.email
  },
    process.env.JWT_SECRET, {
    expiresIn: "1h",
  });


  const userObj = user.toObject();
  delete userObj.password;

  return { token, user: userObj };
};