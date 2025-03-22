import User from '../models/user.model.js';
import appResponse from '../utils/appResponse.js';
import { AppError } from '../utils/appError.js';

export const getProfileHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404 });
    }

    appResponse(res, {
      message: 'Profile fetched successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileHandler = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData._id;
    
    if (req.user.role === 'applicant') {
      if (updateData.education) {
        updateData.education.forEach(edu => {
          if (!edu.institution || !edu.degree) {
            throw new AppError({ 
              message: 'Institution and degree are required for education entries', 
              statusCode: 400 
            });
          }
        });
      }
      
      if (updateData.workExperience) {
        updateData.workExperience.forEach(exp => {
          if (!exp.company || !exp.position) {
            throw new AppError({ 
              message: 'Company and position are required for work experience entries', 
              statusCode: 400 
            });
          }
        });
      }
    } else if (req.user.role === 'recruiter') {
      if (updateData.companyName && updateData.companyName.length < 2) {
        throw new AppError({ 
          message: 'Company name must be at least 2 characters long', 
          statusCode: 400 
        });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      throw new AppError({ message: 'User not found', statusCode: 404 });
    }
    
    appResponse(res, {
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};