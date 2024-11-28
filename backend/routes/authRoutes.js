import express from "express";
import {
  forgotPassword,
  getOtherUserDetail,
  getUserDetail,
  login,
  logout,
  Register,
  resetPassword,
  verifyOTP,
} from "../controllers/authController.js";
import { isAuthorized } from "../middleware/auth.js";

const router = express.Router();

router.post("/auth/register", Register);
router.post("/auth/verify-otp", verifyOTP);
router.post("/auth/login", login);
router.get("/auth/logout", logout);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.get("/auth/user", isAuthorized, getUserDetail);
router.get("/auth/users", isAuthorized, getOtherUserDetail);

export default router;
