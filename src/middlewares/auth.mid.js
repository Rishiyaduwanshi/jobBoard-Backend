import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import config from '../../config/config.js'; 

export const protect = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next(new AppError({ message: "Not authorized", statusCode: 401 }));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    next(new AppError({ message: "Invalid token", statusCode: 401 }));
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
