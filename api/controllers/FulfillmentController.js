const ResponseService = require('../services/ResponseService');
const ShopifyService = require('../services/ShopifyService');
const EncryptionService = require('../services/EncryptionService');
const StripeService = require('../services/StripeService');
const Joi = require('joi');
const _ = require('@sailshq/lodash');
const moment = require('moment');

module.exports = {

  /**
   * Add Tracking Information to Fulfillment
   * API Endpoint :   /add-tracking
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing fulfillmentId, trackingNo, shippingService, and trackingUrl.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and tracking info or relevant error code with message.
   */
  addTracking: async (req, res) => {
    try {
      sails.log.info("====================== ADD TRACKING REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const body = req.body;
      const schema = Joi.object({
        fulfillmentId: Joi.number().required(),
        trackingNo: Joi.string().required(),
        shippingService: Joi.string().required(),
        trackingUrl: Joi.string()
      });

      const validateResult = schema.validate(body);

      if (validateResult.error) {
        return ResponseService.error(res, 'Enter valid information');
      }

      const fulfillmentInfo = await Fulfillment.findOne({ fulfillmentId: body.fulfillmentId });

      const brand = await Brands.find({
        select: ['encrypted_details'],
        where: {
          id: fulfillmentInfo.brandId,
        },
        limit: 1,
      });
      const encrypted_details = brand[0].encrypted_details;
      const decryptedData = EncryptionService.decryptData(encrypted_details);
      const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);

      const info = await ShopifyService.addTracking(BASE_URL, body.fulfillmentId, body.trackingNo, body.trackingUrl, body.shippingService);

      // const fulfillmentInfo = await Fulfillment.findOne({ fulfillmentId: body.fulfillmentId });

      const totalAmount = fulfillmentInfo.amount;
      sails.log.debug('total amount', totalAmount);
      await Fulfillment.update({ fulfillmentId: body.fulfillmentId }).set({ status: true });
      const accountInfo = await Account.find({ id: fulfillmentInfo.accountId });
      if (accountInfo.length > 0) {
        sails.log.debug(fulfillmentInfo);
        if (fulfillmentInfo.transferStatus === false) {
          await Payout.create({
            orderNumber: fulfillmentInfo.orderNumber,
            amount: totalAmount,
            retailerName: accountInfo[0].businessName,
            destination: accountInfo[0].accountId
          });
          await Fulfillment.update({ fulfillmentId: fulfillmentInfo.fulfillmentId }).set({
            transferStatus: true,
            transferComment: 'Payout created',
            shopifyTrackingNumber: body.trackingNo,
            shopifyTrackingLink: body.trackingUrl,
            shopifyTrackingTimestamp: moment().unix()
          }).then(() => {
          });
          // StripeService.transferFunds(accountInfo[0].accountId, amount, {}).then( (res) => {


          // }).catch( (err) => {
          //   sails.log.err('transfer error', err);
          //   Fulfillment.update({fulfillmentId: fulfillmentInfo.fulfillmentId}).set({transferComment: err.message}).then(() => {});
          // });
        } else {
          sails.log.info('Amount already settled');
        }
      } else {
        sails.log.info('Cannot transfer funds due to invalid account or inactive status');
      }

      return res.ok(info.data);
    } catch (e) {
      return ResponseService.error(res, 'Error adding tracking info');
    }
  },

  /**
   * Get Tracking Status
   * API Endpoint :   /tracking-info/:fulfillmentId
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing fulfillmentId param.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and tracking status or relevant error code with message.
   */
  getTrackingStatus: async (req, res) => {
    try {
      sails.log.info("====================== GET TRACKING STATUS REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.params);
      const fulfillmentId = req.allParams().fulfillmentId;
      sails.log.info(fulfillmentId);
      const fulfillmentInfo = await Fulfillment.findOne({ fulfillmentId: req.allParams().fulfillmentId });
      if (fulfillmentInfo) {
        return res.ok(fulfillmentInfo);
      } else {
        res.ok({ 'message': 'Invalid fulfillment' });
      }
    } catch (e) {
      return ResponseService.error(res, e, 'Unable to fetch tracking status');
    }
  },

  /**
   * Get Fulfillments List
   * API Endpoint :   /fulfillments
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request with pagination and filtering params.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and fulfillments list or relevant error code with message.
   */
  getFulfillments: async (req, res) => {
    try {
      sails.log.info("====================== GET FULFILLMENTS LIST REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);
      const params = req.allParams();
      let pageSize = params['pageSize'];
      let page = params['page'];
      const sortBy = params['sort'];
      const status = params['status'];
      const daterange = params['daterange'];
      const accountId = params['accountId'];
      const shopifyTrackingStatus = params['shopifyTrackingStatus'];
      const retailer = params['retailer']; // New query param



      let id = "";

      // agar logged in user super admin hai to req.query se id lelo
      if (req.sessionData.role === 0)  {id = req.query && req.query.brand_id;}
      else if (req.sessionData.role === 3) {id = req.sessionData.brand.id;} // agar logged in user Brand hai to uski id
      else return res.status(500).json({message: 'Only Brand or Super Admin can use this API'});

      const BrandStoreName = await Brands.find({
        select: ['storeName'],
        where: {
          id: id,
        },
        limit: 1,
      });
      const storeName = BrandStoreName[0].storeName;
      console.log("Store name ====================>", storeName);
      let fulfillmentList = [];
      let whereObject = { where: {brandId: id} };

      if (status !== '') {
        whereObject.where.status = status;
      }

      if (daterange !== '') {
        let dateFrom = moment().subtract(daterange, 'days');
        let dateTo = moment();
        whereObject.where.createdAt = { '>': new Date(dateFrom).getTime(), '<': new Date(dateTo).getTime() };
      }

      if (shopifyTrackingStatus !== '') {
        whereObject.where.shopifyTrackingStatus = shopifyTrackingStatus;
      }

      if (accountId !== '') {
        whereObject.where.accountId = accountId;
      }

      let sortObject = {};
      if (sortBy) {
        const sortParam = sortBy.split(' ')[0];
        const sortOrder = sortBy.split(' ')[1];
        sortObject[sortParam] = sortOrder;
        fulfillmentList = await Fulfillment.find({
          where: whereObject.where,
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort([sortObject]);
        console.log("fulfillmentList 1", fulfillmentList);
      } else {
        sortObject = { 'createdAt': 'DESC' };
        fulfillmentList = await Fulfillment.find({
          where: whereObject.where,
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort([{ 'createdAt': 'DESC' }]);
      }
      console.log("fulfillmentList", fulfillmentList);

      // Get retailer information
      const retailerMap = {};
      const retailers = await Account.find({ where: { id: _.map(fulfillmentList, 'accountId') } });
      console.log("Retailers 1 ======================>",retailers);
      for (const retailer of retailers) {
        retailerMap[retailer.id] = retailer;
      }
      console.log("Retailers 2 ======================>",retailers);


      // Add retailerName to fulfillments
      for (let fulfillment of fulfillmentList) {
        const retailer = retailerMap[fulfillment.accountId];
        fulfillment['retailerName'] = retailer ? retailer.businessName : null;
        fulfillment['locationName'] = retailer ? retailer.locationName : null;
        const orderId = fulfillment.shopifyOrderId;
        const shopUrl = `https://${storeName}/`;
        fulfillment['shopifyOrderURL'] = shopUrl + "admin/orders/" + orderId;

        // Add ratings to fulfillments
        const ratings = await AccountRating.findOne({ fulfillmentId: fulfillment.fulfillmentId });

        if (ratings) {
          const x = Number(ratings.price);
          const y = Number(ratings.speed);
          const z = Number(ratings.communication);
          fulfillment['avgPriceRating'] = x;
          fulfillment['avgSpeedRating'] = y;
          fulfillment['avgCommRating'] = z;
          fulfillment['overallAvgRating'] = Math.round((x+y+z) / 3);
          // console.log(ratings);
        } else {
          fulfillment['avgPriceRating'] = 0;
          fulfillment['avgSpeedRating'] = 0;
          fulfillment['avgCommRating'] = 0;
          fulfillment['overallAvgRating'] = 0;
        }
      }

      // Filter by retailerName if provided
      if (retailer) {
        fulfillmentList = fulfillmentList.filter(f => f.retailerName && f.retailerName.toLowerCase().includes(retailer.toLowerCase()));
      }

      let obj = { records: fulfillmentList, page: page, pageSize: pageSize };
      if (parseInt(page) === 1) {
        const totalCount = await Fulfillment.count(whereObject.where);
        obj.total = totalCount;
      }

      return res.ok(obj);
    } catch (e) {
      console.log(e);
      return ResponseService.error(res, e, 'Unable to fetch fulfillments');
    }
  },


  /**
   * Fetch Tracking Details
   * API Endpoint :   /fulfillment/trackingdetail
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and tracking details or relevant error code with message.
   */
  fetchTrackingDetail: async (req, res) => {
    try {
      sails.log.info("====================== FETCH TRACKING DETAIL REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);
      const params = req.allParams();
      let fulfillmentId = params['fulfillmentId'];
      let orderId = params['orderId'];
      let indexKey = params['indexKey'];
      let fulfillment = {}

      const fulfillmentInfo = await Fulfillment.findOne({ fulfillmentId: fulfillmentId });
      console.log(fulfillmentInfo);

      const brand = await Brands.find({
        select: ['encrypted_details'],
        where: {
          id: fulfillmentInfo.brandId,
        },
        limit: 1,
      });
      const encrypted_details = brand[0].encrypted_details;
      const decryptedData = EncryptionService.decryptData(encrypted_details);
      const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
      // console.log("BASE_URL ", BASE_URL);
      // console.log("orderId ", orderId);
      // console.log("fulfillmentId ", fulfillmentId);

      const trackingInfo = await ShopifyService.getTrackingDetail(BASE_URL, orderId, fulfillmentId);
      // console.log("tracking info ===============>",trackingInfo);

      fulfillment = trackingInfo.data.fulfillment;
      // console.log(" fulfillment =====================>",fulfillment);

      var shipmentStatus = trackingInfo.data.fulfillment.shipment_status;
      var shopifyTrackingStatus = "-";

      if (shipmentStatus === 'label_printed') {
        shopifyTrackingStatus = "Label Printed";
      } else if (shipmentStatus === 'label_purchased') {
        shopifyTrackingStatus = "Label Purchased";
      } else if (shipmentStatus === 'attempted_delivery') {
        shopifyTrackingStatus = "Attempted Delivery";
      } else if (shipmentStatus === 'ready_for_pickup') {
        shopifyTrackingStatus = "Ready For Pickup";
      } else if (shipmentStatus === 'confirmed') {
        shopifyTrackingStatus = "Confirmed";
      } else if (shipmentStatus === 'in_transit') {
        shopifyTrackingStatus = "In Transit";
      } else if (shipmentStatus === 'out_for_delivery') {
        shopifyTrackingStatus = "Out For Delivery";
      } else if (shipmentStatus === 'delivered') {
        shopifyTrackingStatus = "Delivered";
      } else if (shipmentStatus === 'failure') {
        shopifyTrackingStatus = "Failure";
      }

      fulfillment['shopifyTrackingStatus'] = shopifyTrackingStatus;
      fulfillment['indexKey'] = indexKey;

      return res.ok({ record: fulfillment });

    } catch (e) {
      return ResponseService.error(res, e, 'Unable to fetch fulfillments tracking detail');
    }
  },

  /**
   * Send Tracking Email
   * API Endpoint :   /order/sendTrackingLink
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing order and tracking information.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and email status or relevant error code with message.
   */
  sendTrackingEmail: async (req, res) => {
    try {
      sails.log.info("====================== SEND TRACKING EMAIL REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const body = req.body;
      const schema = Joi.object().keys({
        email: Joi.string().required(),
        orderId: Joi.number().required()
      })
      const validateResult = schema.validate(body);
      if (validateResult.error) {
        return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, { message: validateResult.error.message });
      }
      // Fetch and decrypt user data

      const encrypted_details = await sails.helpers.fetchLoggedInUsersEncryptedData.with({ req });
      // console.log(" encrypted_details =====================>",encrypted_details);
      const decryptedData = EncryptionService.decryptData(encrypted_details);
      // console.log(" decryptedData =====================>",decryptedData);
      const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
      // console.log(" BASE_URL =====================>",BASE_URL);

      const orderData = (await ShopifyService.getOrderDetails(BASE_URL, body.orderId)).data.order;
      sails.log.debug(orderData);
      const fulfillments = orderData.fulfillments;
      const lineItems = fulfillments[0].line_items;

      const subTotal = _.sum(lineItems, item => item.price).toFixed(2);
      const shippingAmount = parseFloat(orderData.total_shipping_price_set.presentment_money.amount).toFixed(2);
      const taxAmount = _.sum(orderData.tax_lines, tax => parseFloat(tax.price));
      const shippingStripeCharge = ((0.029) * shippingAmount).toFixed(2);
      const gatewayCharges = ((0.029 * (parseFloat(subTotal) + taxAmount)) + parseFloat(0.30) + parseFloat(shippingStripeCharge)).toFixed(2);
      sails.log.debug({ subTotal, shippingAmount, shippingStripeCharge, taxAmount });

      for (let i = 0; i < lineItems.length; i++) {
        const productData = await ProductMeta.findOne({ productId: lineItems[i].product_id, variantId: lineItems[i].variant_id });
        if (productData) {
          lineItems[i].image = productData.imageUrl
        }
      }

      // const shopUrl = `https://${process.env.STORE_URL}`; //! need to get this from encrypted_details instead of env
      const shopUrl = `https://${decryptedData.STORE_URL}`;

      const trackingLink = `${ConstantService.trackingBaseUrl}${fulfillments[0].id}`;

      let content = await sails.renderView('email/alert-v2', {
        orderId: orderData.order_number,
        products: lineItems,
        shippingInfo: orderData.shipping_address,
        trackingLink: trackingLink,
        currency: orderData.currency,
        gatewayCharge: gatewayCharges,
        subtotal: subTotal,
        total: (parseFloat(subTotal) + parseFloat(shippingAmount) + parseFloat(taxAmount) - parseFloat(gatewayCharges)).toFixed(2),
        shippingPrice: shippingAmount,
        layout: false,
        shopUrl: shopUrl,
        taxes: taxAmount.toFixed(2)
      });
      MailService.sendEmailToAccount(body.email, `NEW VOLLEY ORDER FOR FULFILLMENT #${orderData.order_number}`,
        content, true);
      return res.ok({})

    }
    catch (e) {
      sails.log.error(e)
      return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, { message: 'Error sending email' });
    }
  },

};
