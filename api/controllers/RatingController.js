const Joi = require("joi");

/**
 * Rate an Account
 * API Endpoint :   /rate/account
 * API Method   :   POST
 *
 * @param   {Object}        req          Request Object From API Request.
 * @param   {Object}        res          Response Object For API Request.
 * @returns {Promise<*>}    JSONResponse With success code 200 and rating information or relevant error code with message.
 */
const rateAccount = async (req, res) => {
    try {
        sails.log.info("====================== RATE ACCOUNT REQUEST ==============================\n");
        sails.log.info("REQ BODY : ", req.body);

        const brand_id = req.sessionData.brand.id;
        const data = req.body;
        const schema = Joi.object({
            retailer_id: Joi.required(),
            comm_rating: Joi.number().min(1).max(5).required(),
            speed_rating: Joi.number().min(1).max(5).required(),
            price_rating: Joi.number().min(1).max(5).required(),
            fulfillment_id: Joi.string().required(),
        });
        const validateResult = schema.validate(data);
        if (validateResult.error) {
            ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.BAD_REQUEST,
                {
                    error: validateResult.error.message,
                }
            );
        }

        //We need to verify fulfillment at this step before proceeding further. Must revisit
        //Check fulfillment through Brand_id and Fulfillment ID so that others users don't manupulate ratings of your brand


        const rating_data = {
            accountId: data.retailer_id,
            communication: data.comm_rating,
            speed: data.speed_rating,
            price: data.price_rating,
            brandId: brand_id,
            fulfillmentId: data.fulfillment_id
        }
        // console.log(rating_data);

        const response = await AccountRating.create(rating_data).fetch();
        return res.ok({ message: "Rated Successfully.", response })



    } catch (error) {
        return ResponseService.error(res, error, "Something went wrong. :(");
    }
}


/**
 * Get Account Rating
 * API Endpoint :   /rate/account/get
 * API Method   :   GET
 *
 * @param   {Object}        req          Request Object From API Request.
 * @param   {Object}        res          Response Object For API Request.
 * @returns {Promise<*>}    JSONResponse With success code 200 and rating information or relevant error code with message.
 */
const getAccountRating = async (req, res) => {
    try {
        sails.log.info("====================== GET ACCOUNT RATING REQUEST ==============================\n");
        sails.log.info("REQ QUERY : ", req.query);
    } catch (error) {

    }
}


module.exports = {
    rateAccount,
}
