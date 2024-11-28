import User from "../models/userModel.js";
import { sendOtpToEmail } from "../services/sendMail.js";
import crypto from "crypto";

export const generateOtpAndSend = async (user) => {
  try {
    const OTP = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    await User.updateOne(
      { email: user.email },
      {
        verificationCode: OTP,
        verificationCodeExpiresOn: otpExpiry,
      }
    );
    await sendOtpToEmail(user.email, OTP);
    return { OTP, otpExpiry };
  } catch (err) {
    throw err;
  }
};
