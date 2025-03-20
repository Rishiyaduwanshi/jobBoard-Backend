import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import appResponse from '../utils/appResponse.js';
import { AppError } from '../utils/appError.js';
import config from '../../config/config.js';

export const signupHandler = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      throw new AppError({
        message: 'All fields are required',
        statusCode: 400,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError({ message: 'User already exists', statusCode: 400 });
    }

    const newUser = await User.create({ name, email, password, role });
    appResponse(res, {
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const signinHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError({
        message: 'Email and Password are required',
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError({ message: 'Invalid credentials', statusCode: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    appResponse(res, { message: 'Signin successful', data: { _id: user._id, name: user.name, email: user.email, role: user.role, token} });
  } catch (error) {
    next(error);
  }
};

export const checkAuthHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return appResponse(res, { success: false, statusCode: 401 });
    }
    appResponse(res, { 
      message: 'User authenticated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    appResponse(res, { success: false, statusCode: 401 });
  }
};

export const signoutHandler = (req, res) => {
  res.clearCookie('token');
  appResponse(res, { message: 'Sign out successfully' });
};
