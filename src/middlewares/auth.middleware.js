import UserModel from "../models/user.model.js";
import BlackListTokenModel from "../models/blackListToken.model.js";
import { jwtConfig } from "../config/config.js";
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", type: "user" });
  }

  const isBlackListed = await BlackListTokenModel.findOne({ token });

  if (isBlackListed) {
    return res.status(401).json({ error: "Unauthorized", type: "user" });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", type: "user" });
    }
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized", type: "user" });
  }
};

export default authUser;
