export default function appResponse(res, { 
    statusCode = 200, 
    message = 'Success', 
    success = true, 
    data = null 
  }) {
  res.status(statusCode).json({
    message,
    statusCode, 
    success, 
    data: data ?? null, 
  });
  }
  