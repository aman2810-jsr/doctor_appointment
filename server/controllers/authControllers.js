import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken=(user)=>{
    return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER Controller
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email and password required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "Email already registered" });

    // Create user with plain password - User model will hash it in pre-save hook
    const user = await User.create({
      email,
      password,
      role,
    });

    res.status(201).json({ msg: "User registered", userId: user._id });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// LOGIN Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field (normally excluded due to select: false)
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Use model's matchPassword method for comparison
    const valid = await user.matchPassword(password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, role: user.role },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
