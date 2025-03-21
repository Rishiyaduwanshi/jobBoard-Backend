import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import config from '../../config/config.js';

const getIdAndRole = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.user = { userId: decoded.userId, role: decoded.role };
            next();
            return;
        } catch (error) {
            next(new AppError({ message: "Invalid token", statusCode: 401 }));
            return;
        }
    }
    next();
};

export default getIdAndRole;

