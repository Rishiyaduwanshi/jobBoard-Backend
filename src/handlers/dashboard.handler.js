import appResponse from '../utils/appResponse.js';

export const dashboardHandler = (req, res) => {
  appResponse(res, {
    message: 'Welcome to Dashboard',
    data: { user: req.user },
  });
};
