import express from 'express';
import {
  signupHandler,
  signinHandler,
  signoutHandler,
  // getUserProfile,
} from '../handlers/auth.handler.js';
import { protect } from '../middlewares/auth.mid.js';
import { checkAuthHandler } from '../handlers/auth.handler.js';

const router = express.Router();

router.post('/signup', signupHandler);
router.post('/signin', signinHandler);
router.post('/signout', signoutHandler);
// router.get('/profile', protect, getUserProfile);

// Add this route
router.get('/me', protect, checkAuthHandler);

export default router;
