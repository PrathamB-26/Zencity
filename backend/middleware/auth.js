const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zencity_super_secret_jwt_key_2026_secure';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please sign in.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.',
      });
    }
    req.user = decodedUser;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of these roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
