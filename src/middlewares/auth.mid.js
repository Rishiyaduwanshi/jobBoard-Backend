import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new AppError({ message: "Not authorized, token missing", statusCode: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError({ message: "Invalid token, authorization failed", statusCode: 401 }));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError({ message: "Access denied", statusCode: 403 }));
    }
    next();
  };
};
