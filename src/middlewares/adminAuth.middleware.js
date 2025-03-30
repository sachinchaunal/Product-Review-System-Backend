import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { jwtConfig } from "../config/config.js";
import BlackListTokenModel from "../models/blackListToken.model.js";

const adminAuth = async (req, res, next) => {
  const token =
    req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", type: "admin" });
  }

  const isBlackListed = await BlackListTokenModel.findOne({ token });

  if (isBlackListed) {
    return res.status(401).json({ error: "Unauthorized", type: "admin" });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    const admin = await Admin.findOne({
      _id: decoded._id,
    });

    if (!admin) {
      throw new Error();
    }

    req.admin = admin;
    next();
  } catch (e) {
    res.status(401).send({ error: "Unautorized", type: "admin" });
  }
};

export default adminAuth;
