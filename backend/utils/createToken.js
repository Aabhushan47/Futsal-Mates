import jwt from "jsonwebtoken";

export const createJWT = async (user) => {
  return jwt.sign(
    { email: user.email, userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
