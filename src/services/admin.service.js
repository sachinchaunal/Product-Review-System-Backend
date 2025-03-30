import AdminModel from "../models/admin.model.js";

const getModeratorCount = async () => {
  try {
    const count = await AdminModel.countDocuments({ role: "moderator" });
    return count;
  } catch (error) {
    throw error;
  }
};

const createAdmin = async ({ username, password, role }) => {
  try {
    // Check if username already exists
    const existingAdmin = await AdminModel.findOne({ username });
    if (existingAdmin) {
      throw new Error("Username already exists");
    }

    // Create new admin
    const admin = new AdminModel({
      username,
      password,
      role: role || "moderator",
    });

    await admin.save();
    return admin;
  } catch (error) {
    throw error;
  }
};

export default { getModeratorCount, createAdmin };
