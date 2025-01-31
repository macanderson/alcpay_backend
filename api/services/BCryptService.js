const Bcrypt = require("bcrypt");
module.exports = {

    /**
     * Encrypt the password.
     *
     * @param {string} password - Password to be encrypted
     * @returns {Promise<string>} - Hash Password
     */

    encryptedPassword: async (password) => {
        const salt = Bcrypt.genSaltSync(10);
        return await Bcrypt.hash(password, salt);
    },

    /**
     * Check if the encrypted password and the other password is same.
     *
     * @param {string} password - Password
     * @param {string} encryptedPassword - Encrypted password
     * @returns {Promise<boolean>} - Return comparison result
     */

    isSamePassword: async (password, encryptedPassword) => {
        return await Bcrypt.compare(password, encryptedPassword);
    }

};
