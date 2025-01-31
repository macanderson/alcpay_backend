// api/controllers/UrlsController.js

const Joi = require('joi');

module.exports = {
  /**
   * Create a new URL
   * API Endpoint :   /public/urls
   * API Method   :   POST
   * Access      :   Super Admin Only
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and created URL or relevant error code with message.
   */
  create: async (req, res) => {
    try {
      sails.log.info("====================== CREATE URL REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);

      const data = req.body;

      const schema = Joi.object({
        orderCreationUrl: Joi.string().uri().required(),
      });

      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          error: error.message,
        });
      }

      // Optionally, check if a URL already exists to prevent duplicates
      const existingUrl = await Urls.findOne({ orderCreationUrl: value.orderCreationUrl });
      if (existingUrl) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          message: 'URL already exists.',
        });
      }

      const newUrl = await Urls.create(value).fetch();

      return res.ok({
        message: 'URL created successfully.',
        data: newUrl,
      });
    } catch (err) {
      sails.log.error('Error in UrlsController.create:', err);
      return ResponseService.jsonResponse(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
        message: 'Error creating URL.',
      });
    }
  },

  /**
   * Get all URLs
   * API Endpoint :   /public/urls
   * API Method   :   GET
   * Access      :   Any Authorized User
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and list of URLs or relevant error code with message.
   */
  find: async (req, res) => {
    try {
      sails.log.info("====================== GET ALL URLS REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);

      const urls = await Urls.find();

      return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
        message: 'URLs fetched successfully.',
        data: urls,
      });
    } catch (err) {
      sails.log.error('Error in UrlsController.find:', err);
      return ResponseService.jsonResponse(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
        message: 'Error fetching URLs.',
      });
    }
  },

  /**
   * Get URL by ID
   * API Endpoint :   /public/urls/:id
   * API Method   :   GET
   * Access      :   Any Authorized User
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and URL details or relevant error code with message.
   */
  findOne: async (req, res) => {
    try {
      sails.log.info("====================== GET URL BY ID REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.params);

      const { id } = req.params;

      if (!id) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          message: 'URL ID is required.',
        });
      }

      const url = await Urls.findOne({ id });

      if (!url) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.NOT_FOUND, {
          message: 'URL not found.',
        });
      }

      return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
        message: 'URL fetched successfully.',
        data: url,
      });
    } catch (err) {
      sails.log.error('Error in UrlsController.findOne:', err);
      return ResponseService.jsonResponse(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
        message: 'Error fetching URL.',
      });
    }
  },

  /**
   * Update URL by ID
   * API Endpoint :   /public/urls/:id
   * API Method   :   PUT
   * Access      :   Super Admin Only
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and updated URL or relevant error code with message.
   */
  update: async (req, res) => {
    try {
      sails.log.info("====================== UPDATE URL REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      sails.log.info("REQ PARAMS : ", req.params);

      const { id } = req.params;
      const data = req.body;

      if (!id) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          message: 'URL ID is required.',
        });
      }

      const schema = Joi.object({
        orderCreationUrl: Joi.string().uri().required(),
      });

      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          error: error.message,
        });
      }

      // Check if the URL exists
      const existingUrl = await Urls.findOne({ id });

      if (!existingUrl) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.NOT_FOUND, {
          message: 'URL not found.',
        });
      }

      // Optionally, prevent updating to a URL that already exists
      const duplicateUrl = await Urls.findOne({ orderCreationUrl: value.orderCreationUrl, id: { '!=': id } });
      if (duplicateUrl) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          message: 'Another URL with this value already exists.',
        });
      }

      const updatedUrl = await Urls.updateOne({ id }).set(value);

      return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
        message: 'URL updated successfully.',
        data: updatedUrl,
      });
    } catch (err) {
      sails.log.error('Error in UrlsController.update:', err);
      return ResponseService.jsonResponse(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
        message: 'Error updating URL.',
      });
    }
  },

  /**
   * Delete URL by ID
   * API Endpoint :   /public/urls/:id
   * API Method   :   DELETE
   * Access      :   Super Admin Only
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and success message or relevant error code with message.
   */
  delete: async (req, res) => {
    try {
      sails.log.info("====================== DELETE URL REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.params);

      const { id } = req.params;

      if (!id) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
          message: 'URL ID is required.',
        });
      }

      const existingUrl = await Urls.findOne({ id });

      if (!existingUrl) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.NOT_FOUND, {
          message: 'URL not found.',
        });
      }

      await Urls.destroyOne({ id });

      return ResponseService.jsonResponse(res, ConstantService.requestCode.SUCCESS, {
        message: 'URL deleted successfully.',
      });
    } catch (err) {
      sails.log.error('Error in UrlsController.delete:', err);
      return ResponseService.jsonResponse(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
        message: 'Error deleting URL.',
      });
    }
  },
};
