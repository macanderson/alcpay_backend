const ConstantService = require('./ConstantService');
const BCryptService = require('./BCryptService');
const JwtService = require('./JwtService');
const UserService = require('./UserService');

module.exports = {
    login: async (email, password) => {
        const user = await User.findOne({ email: email, isActive: true }).populate('brand');

        if (!user) {
            // No user found
            throw new Error(ConstantService.responseMessage.ERR_MSG_WRONG_CREDENTIALS_API);
        }

        const isSamePassword = await BCryptService.isSamePassword(password, user.password);

        if (!isSamePassword) {
            throw new Error(ConstantService.responseMessage.WRONG_PASSWORD);
        }

        const accessId = user.roleId + (user.id + '').padStart(6, '0');
        const jwtToken = await JwtService.issueNewAccessToken(user, accessId);

        return {
            accessToken: jwtToken.accessToken,
            user: UserService.toResponse(user),
            roleId: user.roleId,
            isSuperAdmin: user.roleId === ConstantService.userType.SUPER_ADMIN,
        };
    },
};
