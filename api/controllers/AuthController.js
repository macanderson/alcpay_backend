const Joi = require('joi');
const ConstantService = require('../services/ConstantService');

module.exports = {
    /**
   * Login
   * API Endpoint :   /public/auth/login
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing email and password.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and brand info or relevant error code with message.
   */
    login: async (req, res) => {
        try {
            const authRequest = {
                email: req.body.email,
                password: req.body.password,
            };

            const schema = Joi.object().keys({
                email: Joi.string().required(),
                password: Joi.string().required(),
            });

            const validateResult = schema.validate(authRequest);

            if (validateResult.error) {
                return ResponseService.json(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    validateResult.error.message
                );
            }

            const data = await AuthService.login(authRequest.email, authRequest.password);

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message: ConstantService.responseMessage.LOG_IN_SUCCESS,
                    data
                }
            );
        } catch (exception) {
            LogService.error(exception);
            // if we have such response message
            if (Object.values(ConstantService.responseMessage).includes(exception.message)) {
                return ResponseService.json(res, ConstantService.requestCode.BAD_REQUEST, exception.message);
            }

            return ResponseService.json(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                ConstantService.responseMessage.ERR_MSG_ISSUE_IN_ADMIN_LOGIN_API
            );
        }
    },

    /**
   * Logout
   * API Endpoint :   /public/auth/logout
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and logout status or relevant error code with message.
   */
    logout: async (req, res) => {
        try {
            const accessId = req.sessionData.accessId;
            RedisService.removeData(accessId);

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                { message: 'Logout successful' }
            );
        } catch (exception) {
            sails.log.error(exception);
            return ResponseService.json(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Error during brand logout.'
            );
        }
    },
};
