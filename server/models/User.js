import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true, // DB-level uniqueness for login
      lowercase: true,
      trim:true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"], // hashed password
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "PATIENT"],
      required: [true, "Please provide a role"],
      default: "PATIENT",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
