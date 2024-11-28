import User from "../models/userModel.js";
import { respond } from "../utils/catchAsyncError.js";
import { createJWT } from "../utils/createToken.js";
import { generateOtpAndSend } from "../utils/otpGenerationSend.js";

export const Register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return respond(res, 400, "All fields are required.");
    }
    w;

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return respond(res, 400, "User already Registered.");
      }

      await User.updateOne(
        { email },
        {
          username,
          password,
        }
      );
      existingUser = await User.findOne({ email }).select("-password");
      //generate otp and send
      await generateOtpAndSend(existingUser);
      return respond(res, 200, "Check your email for verification code.", {
        username: existingUser.username,
        id: existingUser._id,
        email: existingUser.email,
        isVerified: false,
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    user.password = undefined;

    // generate OTP and send
    await generateOtpAndSend(user);

    return respond(res, 200, "Check your email for verification code.", {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: false,
    });
  } catch (err) {
    console.error(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const user = await User.findOne({ verificationCode });
    if (!user) {
      return respond(res, 400, "Invalid OTP");
    }
    if (user.verificationCodeExpiresOn < Date.now()) {
      return respond(res, 400, "OTP expired");
    }
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresOn = null;
    await user.save();
    const token = await createJWT(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      secure: true,
    });
    return respond(res, 200, "Email verified succesfully", {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    });
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return respond(res, 400, "Enter email and password");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return respond(res, 400, "User not found");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return respond(res, 400, "Email or Password is incorrect");
    }
    if (user.isVerified === false) {
      return respond(res, 400, "User not verified");
    }
    user.password = undefined;
    const token = await createJWT(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      secure: true,
    });
    return respond(res, 200, "Logged In succesfully", user);
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(Date.now()) });
    return respond(res, 200, "Logged Out Succesfully");
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return respond(res, 400, "User not found");
    }
    await generateOtpAndSend(user);
    return respond(res, 200, "OTP sent succesfully. Please check your email");
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { verificationCode, newPassword } = req.body;
    const user = await User.findOne({ verificationCode });
    if (!user) {
      return respond(res, 400, "Invalid OTP");
    }
    if (user.verificationCodeExpiresOn < Date.now()) {
      return respond(res, 400, "OTP expired");
    }
    user.password = newPassword;
    user.verificationCode = null;
    user.verificationCodeExpiresOn = null;
    await user.save();
    return respond(res, 200, "Password reset succesfully");
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return respond(res, 400, "User not found");
    }
    return respond(res, 200, "User fetched", user);
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};

export const getOtherUserDetail = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.find(
      {
        _id: { $ne: userId },
      } || { isVerified: true }
    ).select("username email _id");
    if (!user) {
      return respond(res, 400, "No User found");
    }
    return respond(res, 200, "Users fetched", user);
  } catch (err) {
    console.log(err);
    return respond(res, 500, "An error occurred. Please try again.");
  }
};
