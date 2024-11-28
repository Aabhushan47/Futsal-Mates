import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_User,
    pass: process.env.Pass_User,
  },
});

export const sendOtpToEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: "Futsal-Mates",
      to: email,
      subject: "User Verification Code",
      text: `Your Verification Code is ${otp}`,
    });
    return info;
  } catch (err) {
    console.log(err);
    throw new Error(err.message, "Failed to send email");
  }
};
