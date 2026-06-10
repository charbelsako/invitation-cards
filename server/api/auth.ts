import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireDatabase } from '../middleware/requireDatabase';
import { User } from '../models/user';
import { loginInput } from '../schemas/auth';
import { config } from '../utils/config';

export const authRouter = Router();

authRouter.post('/auth/login', requireDatabase, async (request, response, next) => {
  try {
    const parsed = loginInput.parse(request.body);
    const user = await User.findOne({ email: parsed.email.toLowerCase() });
    const isValid = user ? await bcrypt.compare(parsed.password, user.passwordHash) : false;

    if (!user || !isValid) {
      response.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

    response.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});
