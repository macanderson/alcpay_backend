
// api/policies/isSuperAdmin.js

module.exports = async (req, res, next) => {
    try {
      const role = req.sessionData.role; // Assuming role is stored in sessionData
  
      if (role === ConstantService.userType.SUPER_ADMIN) {
        return next(); // Allow access
      }
  
      return ResponseService.json(res, ConstantService.requestCode.FORBIDDEN, {
        message: 'Access denied. Super Admins only.',
      });
    } catch (error) {
      return ResponseService.json(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
        message: 'Error verifying user role.',
      });
    }
  };
  