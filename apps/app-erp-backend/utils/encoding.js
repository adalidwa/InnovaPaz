// Middleware for handling text encoding
export const encodingMiddleware = (req, res, next) => {
  // Set charset for responses
  res.set('Content-Type', 'application/json; charset=utf-8');

  // Ensure proper encoding for incoming requests
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    req.setEncoding('utf8');
  }

  next();
};
