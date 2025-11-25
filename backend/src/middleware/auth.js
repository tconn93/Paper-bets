import jwt from "jsonwebtoken";
import { AppError } from "../errors.js";

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, jwtSecret);
    console.log('Verifying token:', token ? 'present' :
'missing', token ? token.substring(0, 20) + '...' :
'');
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET;

      if (jwtSecret && token) {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
        };
      }
    }

    next();
  } catch (error) {
    // If optional auth fails, continue without user
    next();
  }
};

export { authenticate, optionalAuth };
