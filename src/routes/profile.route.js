import express from 'express';
import { getProfileHandler, updateProfileHandler } from '../handlers/profile.handler.js';
import { protect } from '../middlewares/auth.mid.js';

const router = express.Router();

router.route('/profile')
    .get(protect, getProfileHandler)
    .patch(protect, updateProfileHandler);


export default router;