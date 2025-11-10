// Middleware to check if user has required role(s)
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const hasRole = allowedRoles.includes(req.userRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = roleCheck;
