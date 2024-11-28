import jwt from "jsonwebtoken";
import { respond } from "../utils/catchAsyncError.js";

export const isAuthorized = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      respond(res, 400, "Access denied. No token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    respond(res, 500, "Invalid token");
  }
};
