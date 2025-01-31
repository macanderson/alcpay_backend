module.exports = {
    toResponse: (user) => {
        const result = _.omit(user, ['brand', 'password']);

        if (user.brand) {
            result.brand = user.brand[0];
        }

        return result;
    },
};
