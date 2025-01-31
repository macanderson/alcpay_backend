const Constants = require('../../config/constants');

module.exports = {
  json: function (res, status, message, data, meta) {
    let response = {
      message: message,
    };
    if (typeof data !== 'undefined') {
      response.data = data;
    }
    if (typeof meta !== 'undefined') {
      response.meta = meta;
    }

    if (status === Constants.requestCode.INTERNAL_SERVER_ERROR) {
      sails.log.error(message);
      response.message = Constants.responseMessage.ERR_OOPS_SOMETHING_WENT_WRONG;
    }

    sails.log.info('RESPONSE :', response);
    return res.status(status).json(response);
  },

  jsonResponse: function (res, status, data) {
    let response = {};
    if (typeof data !== 'undefined') {
      response = data;
    }

    sails.log.info('RESPONSE :', response);
    return res.status(status).json(response);
  },

  error: function (res, error, message) {
    sails.log.error(error);
    return res.json({message}).status(500);
  },

  badRequest: function (res, message) {
    return res.json({message}).status(400);
  }
};
