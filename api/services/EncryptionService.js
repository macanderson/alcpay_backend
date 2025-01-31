// services/EncryptionService.js
const crypto = require('crypto');
module.exports = {
    encryptData: function (data) {
        try {
            sails.log.info('Encrypting Data...');
            const publicKey = sails.config.custom.STORE_ENCRYPTION_PUBLIC_KEY;
            if (!publicKey) {
                throw new Error('Public key is missing in environment variables.');
            }
            const buffer = Buffer.from(JSON.stringify(data));
            const encryptedData = crypto.publicEncrypt(publicKey, buffer);
            return encryptedData.toString('base64');
        } catch (error) {
            sails.log.error('Error encrypting data: ', error);
            throw error;
        }
    },
    decryptData: function (encryptedData) {
        try {
            sails.log.info('Decrypting Data...');
            const privateKey = sails.config.custom.STORE_ENCRYPTION_PRIVATE_KEY.split(String.raw`\n`).join('\n');
            if (!privateKey) {
                throw new Error('Private key is missing in environment variables.');
            }
            const buffer = Buffer.from(encryptedData, 'base64');
            const decryptedData = crypto.privateDecrypt(privateKey, buffer);
            return JSON.parse(decryptedData.toString());
        } catch (error) {
            sails.log.error('Error decrypting data: ', error);
            throw error;
        }
    },
    decryptDataToBASE_URL:  function (decryptedObject)  {
        sails.log.info('Processing Decrypted Data...');
        const BASE_URL = `https://${decryptedObject.STORE_ACCESS_ID}:${decryptedObject.STORE_PASSWORD}@${decryptedObject.STORE_URL}/admin/api/${decryptedObject.API_VERSION}/`;
        // console.log("BASE_URL ",BASE_URL);
        return BASE_URL;
      },
    decryptDataToBase_url:  function (decryptedObject) {
        sails.log.info('Processing Decrypted Data...');
        const base_url = `https://${decryptedObject.STORE_URL}/admin/api/${decryptedObject.API_VERSION}/`;
        // console.log("base_url ",base_url);
        return base_url;
      },
      
};
