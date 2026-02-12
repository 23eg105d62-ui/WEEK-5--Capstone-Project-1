import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const verifyToken = async (req, res, next) => {
  
    //read token from cookies 
    let token = req.cookies?.token ;

    //check if token exists
    if (!token) {
      return res.status(401).json({ message: "Unauthorized request. Please login" });
    }

    //verify the token (decoding the token)
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    //attach decoded token to request object for downstream use
    req.user = decodedToken;

    //forward req to next middleware/route
    next();
  
};

