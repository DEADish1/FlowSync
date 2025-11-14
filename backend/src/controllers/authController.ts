import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest, generateToken } from '../middleware/auth';
import { pool } from '../utils/db';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError(400, 'User already exists');
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, created_at`,
        [email, password_hash, name]
      );

      const user = result.rows[0];

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT id, email, name, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new AppError(401, 'Invalid credentials');
      }

      const user = result.rows[0];

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await pool.query(
        'SELECT id, email, name, timezone, preferences FROM users WHERE id = $1',
        [req.user!.userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'User not found');
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // In a production app, you might want to blacklist the token
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
