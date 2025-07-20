// middleware/checkRole.js
export function authRole(requiredRoles) {
  return (req, res, next) => {
    const userRole = req.user.role; // assumed to be decoded from JWT
    if (requiredRoles.includes(userRole)) {
      return next();
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  };
}

