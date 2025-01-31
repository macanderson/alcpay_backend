module.exports = (req, res, next) => {
    let token;

    //Authenticate the token and check if token is valid.
    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2) {
            const scheme = parts[0],
                credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return ResponseService.json(res, ConstantService.requestCode.UNAUTHORIZED, ConstantService.responseMessage.ERR_MSG_WRONG_FORMAT_AUTHORIZATION);
        }
    } else if (req.param('accessToken')) {
        token = req.param('accessToken');
    } else {
        return ResponseService.json(res, ConstantService.requestCode.UNAUTHORIZED, ConstantService.responseMessage.ERR_MSG_NO_HEADER_AUTHORIZATION);
    }

    // Verify the JWT token
    JwtService.verify(token, (err, payload) => {
        if (err) {
            return ResponseService.json(res, ConstantService.requestCode.UNAUTHORIZED, ConstantService.responseMessage.ERR_MSG_INVALID_SESSION);
        }
        console.log(payload)
        // Attach the decoded payload to the request object
        req.accessToken = token;
        req.sessionData = payload;

        // Check role-based access restrictions for certain routes
        const route = req.path; // Get the route path being accessed
        const role = payload.role; // Get the user's role

        // Define which routes are restricted for each role
        const restrictedRoutes = {
            [ConstantService.userType.BRAND]: [
                '/public/brand/all',  // Example route: Restrict Brands from accessing "All Brands"
                '/public/brand/handle-commission',
                '/toggle-retailer-status',
                '/public/kpi/orders',
                '/public/kpi/brand-orders',
                '/stripe/create-account',
                '/account/edit',
                // Add other routes to restrict for Brands in the future
            ],
            [ConstantService.userType.STAFF]: [
                '/public/brand/all',  // Example route: Restrict Staff from accessing "All Brands"
                '/public/kpi/orders',
                '/public/kpi/brand-orders',
                '/stripe/create-account',
                '/account/edit',
                // Add other routes to restrict for Staff in the future
            ]
        };

        // Allow access if Super Admin (role 0)
        if (role === ConstantService.userType.SUPER_ADMIN) {
            return next();  // Super Admin has access to everything
        }

        // Check if the current route is restricted for the user role
        if (restrictedRoutes[role] && restrictedRoutes[role].includes(route)) {
            return ResponseService.json(res, ConstantService.requestCode.FORBIDDEN, ConstantService.responseMessage.ERR_MSG_FORBIDDEN);
        }

        // If no restriction is found, allow the request to continue
        next();
    });
};
