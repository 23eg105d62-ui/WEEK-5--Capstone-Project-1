import UserModel from "../models/UserModel.js"

export const checkUser = async (req, res, next) => {
    //get user id from body or params
    let userId = req.body?.user || req.params?.userId;
    //find user
    let user = await UserModel.findById(userId);
    //verify user exists
    if (!user) {
        return res.status(404).json({ message: "User not found... Please register" });
    }
    //verify user role is USER
    if (user.role !== "USER") {
        return res.status(403).json({ message: "Access denied. USER role required" });
    }
    //check if user account is active
    if (!user.isActive) {
        return res.status(403).json({ message: "User account is not active" });
    }
    //forward req to next
    next();
};
