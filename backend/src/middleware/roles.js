export function authorizeRoles(...allowedRoles) {
  if (
    !Array.isArray(allowedRoles) ||
    allowedRoles.length === 0
  ) {
    throw new Error(
      'authorizeRoles requires at least one role'
    );
  }

  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
}

export default authorizeRoles;


