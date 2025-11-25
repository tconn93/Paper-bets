import { body, validationResult } from "express-validator";
import { AuthService } from "../services/authService.js";


export class AuthController {
  static registerValidation = [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("username")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, underscores, and hyphens",
      ),
  ];

  static loginValidation = [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ];

  static async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
        return;
      }

      const input = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
      };

      const result = await AuthService.register(input);

      res.status(201).json({
        success: true,
        data: result,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
        return;
      }

      const input = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await AuthService.login(input);

      res.status(200).json({
        success: true,
        data: result,
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const profile = await AuthService.getUserProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBalance(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const balance = await AuthService.getBalance(req.user.id);

      res.status(200).json({
        success: true,
        data: { balance },
      });
    } catch (error) {
      next(error);
    }
  }
}
