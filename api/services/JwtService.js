const Jwt = require('jsonwebtoken');
const JwtSecret = sails.config.session.secret;

module.exports = {

    /**
     * Issue new access token ( and refresh token if not attendant).
     *
     * @param user - user object
     * @param accessId - Access Id of user
     * @returns {Promise<void>}
     */

    issueNewAccessToken: async (user, accessId) => {
        let payload = {
            id: user.id,
            accessId: accessId,
            role: user.roleId,
            pushData: {}
        };

        if (user.brand && user.brand[0]) {
            payload.brand = {
                id: user.brand[0].id
            };
        }

        let jwtResponse = {};
        jwtResponse.accessToken = Jwt.sign(payload, JwtSecret);

        payload.token = jwtResponse.accessToken;

        payload = _.omit(payload, ['type']);

        RedisService.setData(payload.accessId, payload);
        return jwtResponse;
    },

    /**
     * Verify token.
     *
     * @param token - JWT Token to be verified
     * @param callback - With payload if success else error object
     */

    verify: (token, callback) => {
        Jwt.verify(token, JwtSecret, (err, decoded) => {
            if (err) return callback(err);
            RedisService.getData(decoded.accessId).then((payload) => {
                    return callback(null, payload);
                })
                .catch(() => {
                    return callback(true);
                });

        });
    },

};
