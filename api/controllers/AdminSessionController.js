const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const JwtSecret = sails.config.session.secret;
module.exports = {

    /**
     * Admin Login
     * API Endpoint :   /public/admin/login
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
     */

    adminLogin: async (req, res) => {
        try {
            sails.log.info("====================== ADMIN LOGIN : DASHBOARD REQUEST ==============================\n");
            sails.log.info("REQ BODY : ", req.body);

            const loginRequest = {
                email: req.body.email,
                password: req.body.password,
            };

            const schema = Joi.object().keys({
                email: Joi.string().required(),
                password: Joi.string().required(),
            });

            const validateResult = schema.validate(loginRequest);

            if (validateResult.error) {
                return ResponseService.json(res, ConstantService.requestCode.BAD_REQUEST, validateResult.error.message);
            }

            let response = {};
            let userType = 0;

            //Check for super admin
            let admin = await SuperAdmin.find({
                select: ['id', 'name', 'email', 'password'],
                where: {email: loginRequest.email, isEnabled: true},
                limit: 1,
            });

            if (!_.isEmpty(admin)) {
                admin = admin[0];
                admin.roleId = ConstantService.staffRole.SUPER_ADMIN;
                userType = ConstantService.userType.SUPER_ADMIN;
            } else {

                //Check for builder staff
                admin = await Staff.find({
                    select: ['id', 'name', 'email', 'password', 'roleId'],
                    where: {
                        email: loginRequest.email,
                        status: true,
                        deletedAt: null
                    },
                    limit: 1
                });

                if (!_.isEmpty(admin)) {
                    admin = admin[0];
                    userType = ConstantService.userType.STAFF;
                } else {
                    //No super admin or staff found with this org id
                    return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
                        message: ConstantService.responseMessage.ERR_MSG_WRONG_CREDENTIALS_API,
                    });
                }

            }

            const isSamePassword = await BCryptService.isSamePassword(loginRequest.password, admin.password);

            if (!isSamePassword) {
                return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
                    message: ConstantService.responseMessage.WRONG_PASSWORD,
                });
            }

            admin = _.omit(admin, ['password']);

            response.admin = admin;
            let accessId = '';
            let jwtToken = '';

            switch (userType) {
                case ConstantService.userType.SUPER_ADMIN :
                    response.isSuperAdmin = true;

                    accessId = ConstantService.prefixAccessId.SUPER_ADMIN + (admin.id + "").padStart(6, '0');
                    jwtToken = await JwtService.issueNewAccessToken(admin.id, accessId, ConstantService.userType.SUPER_ADMIN);

                    response.token = jwtToken.accessToken;
                    break;
                case ConstantService.userType.STAFF:
                    response.isSuperAdmin = false;

                    accessId = ConstantService.prefixAccessId.STAFF + (admin.id + "").padStart(6, '0');
                    jwtToken = await JwtService.issueNewAccessToken(admin.id, accessId, ConstantService.userType.STAFF);

                    response.token = jwtToken.accessToken;
                    break;
                default:
                    break;
            }

            response.roleId = admin.roleId;

            return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
                message: ConstantService.responseMessage.LOG_IN_SUCCESS,
                data: response
            });


        } catch (exception) {
            LogService.error(exception);
            return ResponseService.json(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.ERR_MSG_ISSUE_IN_ADMIN_LOGIN_API);
        }
    },

    /**
     * Admin access token Login.
     * API Endpoint :   /admin/accessTokenLogin
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
     */

    adminAccessTokenLogin:
        async (req, res) => {
            try {
                sails.log.info("======================  ACCESS TOKEN LOGIN : ADMIN REQUEST ==============================\n");
                sails.log.info("REQ BODY : ", req.body);

                const userType = req.sessionData.role;
                const userId = req.sessionData.id;
                const accessId = req.sessionData.accessId;

                let response = {};
                let admin = {};

                switch (userType) {
                    case ConstantService.userType.SUPER_ADMIN:
                        //Check for super admin
                        admin = await SuperAdmin.find({
                            select: ['id', 'name', 'email'],
                            where: {id: userId, isEnabled: true},
                            limit: 1,
                        });

                        if (!_.isEmpty(admin)) {
                            admin[0].roleId = ConstantService.staffRole.SUPER_ADMIN;
                        }
                        response.isSuperAdmin = true;

                        break;
                    case ConstantService.userType.STAFF:
                        response.isSuperAdmin = false;
                        admin = await Staff.find({
                            select: ['id', 'name', 'email', 'roleId'],
                            where: {
                                id: userId,
                                status: true,
                                deletedAt: null
                            },
                            limit: 1
                        });

                        break;
                    default:
                        break;
                }


                if (!_.isEmpty(admin)) {
                    admin = admin[0];
                    response.admin = admin;
                    response.roleId = admin.roleId;

                    if (userType === ConstantService.userType.STAFF) {
                        response.isSuperAdmin = false;
                    }

                    response.token = req.accessToken;

                    if (accessId) {
                        //Update and verify all device tokens
                        try {
                            const data = req.sessionData;
                            const newPushData = {};
                            if (!_.isEmpty(data.pushData)) {
                                const pushList = _.keys(data.pushData);
                                for (const push of pushList) {
                                    await Jwt.verify(push, JwtSecret, async (err, decoded) => {
                                        if (!err) {
                                            newPushData[push] = data.pushData[push];
                                        }
                                    });
                                }
                            }

                            data.pushData = newPushData;
                            RedisService.setData(accessId, data);

                        } catch (exception) {
                            LogService.error(exception);
                        }
                    }
                    return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
                        message: ConstantService.responseMessage.LOG_IN_SUCCESS,
                        data: response
                    });

                } else {
                    return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
                        message: ConstantService.responseMessage.NO_USER_FOUND,
                    });
                }

            } catch (exception) {
                LogService.error(exception);
                return ResponseService.json(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.ERR_MSG_ISSUE_IN_ADMIN_ACCESS_TOKEN_LOGIN_API);
            }
        },

    /**
     * Admin Logout
     * API Endpoint :   /admin/logout
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
     */

    logoutAdmin:
        async (req, res) => {

            try {
                sails.log.info("====================== LOGOUT : ADMIN REQUEST ==============================\n");

                const accessId = req.sessionData.accessId;

                RedisService.removeData(accessId);

                return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
                    message: ConstantService.responseMessage.LOG_OUT_SUCCESS
                });
            } catch (exception) {

                LogService.error(exception);
                return ResponseService.json(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.ERR_MSG_ISSUE_IN_ADMIN_LOGOUT_API);
            }

        },

};

