import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/config.js";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ["super_admin", "moderator"],
      default: "moderator",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  const admin = this;
  if (admin.isModified("password")) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});

adminSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id, role: this.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiration,
  });

  return token;
};

adminSchema.statics.findByCredentials = async (username, password) => {
  const admin = await Admin.findOne({ username }).select("+password");
  if (!admin) {
    throw new Error("Unable to login");
  }

  try {
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error("Unable to login");
    }
  } catch (e) {
    throw e;
  }
  return admin;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
