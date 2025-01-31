const Joi = require("joi");
// const Account = require("../models/Account");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {calculateRatings} = require("../services/RatingUtil.js")

/**
 * Edit Retailer Request
 * API Endpoint :   /account/edit-request-retailer
 * API Method   :   PUT
 *
 * @param   {Object}        req          Request Object From API Request containing retailer details.
 * @param   {Object}        res          Response Object For API Request.
 * @returns {Promise<*>}    JSONResponse With success code 200 and updated retailer or relevant error code with message.
 */
const editRequestRetailer = async (req, res) => {
  try {
    sails.log.info("====================== EDIT RETAILER REQUEST ==============================\n");
    sails.log.info("REQ BODY : ", req.body);
    // const request_id = req.body.request_id
    const data = req.body;
    const user_id = req.sessionData.id;
    const schema = Joi.object({
      id: Joi.required(),
      businessName: Joi.string().required(),
      email: Joi.string().required(),
      contact: Joi.string().required(),
      website: Joi.string().required(),
      stripe: Joi.boolean().required(),
      inHouseBusiness: Joi.boolean().required(),
    });

    const validateResult = schema.validate(data);

    if (validateResult.error) {
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.BAD_REQUEST,
        {
          error: validateResult.error.message,
        }
      );
    }

    const retailer_request = await RequestedRetailer.findOne({ id: data.id, userId: user_id });

    if (retailer_request) {
      var updateData = {
        businessName: data.businessName,
        email: data.email,
        contact: data.contact,
        website: data.website,
        stripe: data.stripe,
        inHouseBusiness: data.inHouseBusiness,
      };
      await RequestedRetailer.update({ id: data.id }, updateData);
      return res.ok({ message: "Record Updated Successfully." });
    } else {
      return ResponseService.error(
        res,
        ConstantService.requestCode.BAD_REQUEST,
        "Invalid Request ID."
      );
    }


  } catch (error) {
    return ResponseService.error(res, error, "Something went wrong :(");

  }
}

/**
 * Delete Retailer Request
 * API Endpoint :   /account/delete-request-retailer
 * API Method   :   DELETE
 *
 * @param   {Object}        req          Request Object From API Request containing request ID.
 * @param   {Object}        res          Response Object For API Request.
 * @returns {Promise<*>}    JSONResponse With success code 200 and deletion status or relevant error code with message.
 */
const deleteRequestRetailer = async (req, res) => {
  try {
    sails.log.info("====================== DELETE RETAILER REQUEST ==============================\n");
    sails.log.info("REQ QUERY : ", req.query);
    const data = req.allParams();
    const user_id = req.sessionData.id;
    const schema = Joi.object({
      id: Joi.required(),
    });

    const validateResult = schema.validate(data);

    if (validateResult.error) {
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.BAD_REQUEST,
        {
          error: validateResult.error.message,
        }
      );
    }

    const retailer_request = await RequestedRetailer.findOne({ id: data.id, userId: user_id });

    if (retailer_request) {
      await RequestedRetailer.destroyOne({ id: data.id });
      return res.ok({ message: "Record Deleted Successfully." });
    } else {
      return ResponseService.error(
        res,
        ConstantService.requestCode.BAD_REQUEST,
        "Invalid Request ID."
      );
    }

  } catch (error) {
    return ResponseService.error(res, error, "Something went wrong :(");

  }
}

/**
 * Toggle Retailer Request Status
 * API Endpoint :   /account/toggle-request-retailer
 * API Method   :   PUT
 *
 * @param   {Object}        req          Request Object From API Request containing request ID and status.
 * @param   {Object}        res          Response Object For API Request.
 * @returns {Promise<*>}    JSONResponse With success code 200 and updated status or relevant error code with message.
 */
const toggleRetailerRequest = async (req, res) => {
  try {
    sails.log.info("====================== TOGGLE RETAILER REQUEST ==============================\n");
    sails.log.info("REQ BODY : ", req.body);
    const data = {
      id: req.body.id,
    }
    const schema = Joi.object({
      id: Joi.required(),
    });

    const validateResult = schema.validate(data);

    if (validateResult.error) {
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.BAD_REQUEST,
        {
          error: validateResult.error.message,
        }
      );
    }

    let retailer_request = await RequestedRetailer.findOne({ id: data.id });

    if (retailer_request) {

      let current_status = retailer_request.isRequested;
      current_status = current_status ? false : true;
      retailer_request = await RequestedRetailer.update({ id: data.id }, { isRequested: current_status }).fetch();

      //Add Retailer to DB. Revisit


      return res.ok({ message: "Status Updated Successfully.", status: retailer_request[0] && retailer_request[0].isRequested });
    } else {
      return ResponseService.error(
        res,
        ConstantService.requestCode.BAD_REQUEST,
        "Invalid Request ID."
      );
    }

  } catch (error) {
    return ResponseService.error(res, error, "Something went wrong :(");

  }
}


/**
 * Get All States
 * API Endpoint :   /account/states
 * API Method   :   GET
 *
 * @param   {Object}        req          Request Object From API Request.
 * @param   {Object}        res          Response Object For API Request.
 * @returns {Promise<*>}    JSONResponse With success code 200 and states list or relevant error code with message.
 */
const allStates = async (req, res) => {
  try {
    sails.log.info("====================== GET ALL STATES REQUEST ==============================\n");
    sails.log.info("REQ QUERY : ", req.query);
    const states = await States.find({}).populate('accounts');
    return res.ok({ states });
  } catch (error) {
    return ResponseService.error(res, error, "Something went wrong :(");
  }
}



module.exports = {
  /**
   * Link Location ID to Account
   * API Endpoint :   /account/link-location
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing location and account details.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and linked account or relevant error code with message.
   */
  linkLocationIdToAccount: async (req, res) => {
    try {
      sails.log.info("====================== LINK LOCATION TO ACCOUNT REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;

      const schema = Joi.object({
        id: Joi.number().required(),
        locationId: Joi.string().required(),
        locationName: Joi.string(),
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      const isAccountAlreadyLinked = await Account.count({
        id: { "!=": data.locationId },
        locationId: data.locationId,
      });

      if (isAccountAlreadyLinked > 0) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            message: ConstantService.responseMessage.ACCOUNT_ALREADY_LINKED,
          }
        );
      }

      await Account.update(
        { id: data.id },
        { locationId: data.locationId, locationName: data.locationName }
      );

      return res.ok({});
    } catch (e) {
      return ResponseService.error(res, e, "Error linking account info");
    }
  },

  /**
   * Unlink Location ID from Account
   * API Endpoint :   /account/unlink-location
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing location and account details.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and unlinked account or relevant error code with message.
   */
  unlinkLocationIdToAccount: async (req, res) => {
    try {
      sails.log.info("====================== UNLINK LOCATION FROM ACCOUNT REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;

      const schema = Joi.object({
        id: Joi.number().required(),
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      await Account.update(
        { id: data.id },
        { locationId: "", locationName: "" }
      );

      return res.ok({});
    } catch (e) {
      return ResponseService.error(res, e, "Error linking account info");
    }
  },

  /**
   * Activate Account
   * API Endpoint :   /account/activate
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing account ID.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and activated account or relevant error code with message.
   */
  activateAccount: async (req, res) => {
    try {
      sails.log.info("====================== ACTIVATE ACCOUNT REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;

      const schema = Joi.object({
        accountId: Joi.string().required(),
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      await Account.update(
        { accountId: data.accountId },
        { isActivated: true }
      );

      return res.ok({});
    } catch (e) {
      return ResponseService.error(res, e, "Error activating account info");
    }
  },

  /**
   * Get Account List
   * API Endpoint :   /account/list
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and accounts list or relevant error code with message.
   */
  accountList: async (req, res) => {
    try {
      sails.log.info("====================== GET ACCOUNT LIST REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);
      // Fetch all accounts (retailers)
      const accounts = await Account.find({}).populate('states');
      // Get ratings and calculate averages for each retailer
      const accountsWithRatings = await Promise.all(
        accounts.map(async (account) => {
          // Fetch ratings for each retailer
          const ratings = await AccountRating.find({
            where: { accountId: account.id }
          });

          // Calculate the ratings averages
          const { avgPriceRating, avgSpeedRating, avgCommRating, overallAvgRating } = calculateRatings(ratings);

          // Assign calculated ratings to account
          account.avgPriceRating = avgPriceRating;
          account.avgSpeedRating = avgSpeedRating;
          account.avgCommRating = avgCommRating;
          account.overallAvgRating = overallAvgRating;

          return account;
        })
      );

      // Return the accounts with ratings averages
      return res.ok({ account: accountsWithRatings });
    } catch (e) {
      return ResponseService.error(res, e, "Error fetching accounts");
    }
  },

  /**
   * Add CMS Retailer Request
   * API Endpoint :   /account/add-cms-retailer
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing retailer details.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and created request or relevant error code with message.
   */
  addRequestedCMSRetailer: async (req, res) => {
    try {
      sails.log.info("====================== ADD CMS RETAILER REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;
      const user_id = req.sessionData.id;
      const schema = Joi.object({
        businessName: Joi.string().required(),
        email: Joi.string().required(),
        contact: Joi.string().required(),
        website: Joi.string().required(),
        stripe: Joi.boolean().required(),
        inHouseBusiness: Joi.boolean().required(),
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }
      const account = await RequestedRetailer.create({
        ...data,
        userId: user_id,
      }).fetch();
      return res.ok({ account });
    } catch (e) {
      return ResponseService.error(res, e, "Error adding requested retailer");
    }
  },

  /**
   * Get CMS Retailer Requests
   * API Endpoint :   /account/get-cms-retailers
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and retailers list or relevant error code with message.
   */
  getRequestedCMSRetailers: async (req, res) => {
    try {
      sails.log.info("====================== GET CMS RETAILERS REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);
      let retailers;
      if (req.sessionData.role === 0) {
        retailers = await RequestedRetailer.find({});
      } else {
        retailers = await RequestedRetailer.find({
          userId: req.sessionData.id,
        });
      }

      // Function to fetch ratings in batches
      const fetchRatingsInBatches = async (accountId, offset = 0, limit = 100) => {
        return await AccountRating.find({
          where: { accountId: accountId },
          skip: offset,
          limit: limit
        });
      };

      // Map retailers to include their rating averages
      retailers = await Promise.all(
        retailers.map(async (retailer) => {
          let retailerRatings = [];
          let offset = 0;
          const batchSize = 100;

          // Fetch and accumulate ratings in batches
          while (true) {
            const batchRatings = await fetchRatingsInBatches(retailer.id, offset, batchSize);
            if (batchRatings.length === 0) break;
            retailerRatings = retailerRatings.concat(batchRatings);
            offset += batchSize;
          }

          // Calculate averages using the utility function
          const { avgPriceRating, avgSpeedRating, avgCommRating, overallAvgRating } = calculateRatings(retailerRatings);

          // Assign calculated averages to retailer
          retailer.avgPriceRating = avgPriceRating;
          retailer.avgSpeedRating = avgSpeedRating;
          retailer.avgCommRating = avgCommRating;
          retailer.overallAvgRating = overallAvgRating;

          return retailer;
        })
      );
      // Return the retailers with ratings averages
      return res.ok(retailers);
    } catch (error) {
      console.error(error);
      return ResponseService.error(res, error, "Something went wrong. :(");
    }
  },
  // getActiveRetailers: async (req,res)=> {
  //   try {
  //     const brandId = req.sessionData.id;
  //     // console.log("brandId, ", brandId);
  //     // brand product rule

  //     //mein jin jin k retailers k sath as a brand kaam kar rha hun woh chahye
  //     //get active retailers
  //     retailers = await RequestedRetailer.find({id});
  //     // console.log("retailer, " , retailer);
  //     return res.ok(retailers);
  //     // define the criteria for active retailers
  //   } catch (e) {
  //     console.log(e);
  //     return ResponseService.error(res, e, "Error fetching active accounts");
  //   }
  // },
  /**
   * Delete Account
   * API Endpoint :   /account/delete
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request containing account ID.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and deletion status or relevant error code with message.
   */
  deleteAccount: async (req, res) => {
    try {
      sails.log.info("====================== DELETE ACCOUNT REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);
      const id = req.body.id;
      const accountInfo = await Account.findOne({ id });
      sails.log.debug(accountInfo);
      await Account.destroy({ id });
      await StripeService.deleteAccount(accountInfo.accountId);
      return res.ok({ message: "Account deleted" });
    } catch (e) {
      return ResponseService.error(res, e, "Error deleting account");
    }
  },

  /**
   * Change In-House Business Status
   * API Endpoint :   /account/change-in-house-business
   * API Method   :   PUT
   *
   * @param   {Object}        req          Request Object From API Request containing account ID and status.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and updated account or relevant error code with message.
   */
  changeInHouseBusiness: async (req, res) => {
    try {
      sails.log.info("====================== CHANGE IN-HOUSE BUSINESS REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;

      const schema = Joi.object({
        id: Joi.required(),
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      var accountInfo = await Account.findOne({ id: data.id });
      if (accountInfo) {
        await Account.update(
          { id: data.id },
          { inHouseBusiness: !accountInfo.inHouseBusiness }
        );
        return res.ok({});
      } else {
        return ResponseService.error(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          "Error changing in house business"
        );
      }
    } catch (e) {
      return ResponseService.error(res, e, "Error changing in house business");
    }
  },

  /**
   * Update Account Details
   * API Endpoint :   /account/update
   * API Method   :   PUT
   *
   * @param   {Object}        req          Request Object From API Request containing account details.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and updated account or relevant error code with message.
   */
  updateAccount: async (req, res) => {
    try {
      sails.log.info("====================== UPDATE ACCOUNT REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;
      // return data;
      const schema = Joi.object({
        id: Joi.required(),
        businessName: Joi.required(),
        email: Joi.required(),
        contact: Joi.required(),
        website: Joi.required(),
        states: Joi.array()
          .items(Joi.number().integer().positive().required()) // Ensure each item is a positive integer
          .min(1) // At least one ID is required
          .required(), // The array itself is required
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      var accountInfo = await Account.findOne({ id: data.id });
      if (accountInfo) {
        var updateData = {
          businessName: data.businessName,
          email: data.email,
          contact: data.contact,
          website: data.website,

        };
        const updated_account = await Account.update({ id: data.id }, updateData).fetch()
        await Account.replaceCollection(data.id, "states").members(data.states)

        return res.ok({ message: "Retailer Data has been Updated. " });
      } else {
        console.log(ConstantService.requestCode.BAD_REQUEST);



        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          "Invalid Retailer ID."
        );
      }
    } catch (e) {
      console.log(e);
      return ResponseService.error(res, e, "Error updating account");
    }
  },
  editRequestRetailer,
  deleteRequestRetailer,
  toggleRetailerRequest,
  allStates

};
