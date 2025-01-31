const LocationHelper = require('../services/LocationHelper');
const ShopifyService = require('../services/ShopifyService');
const ResponseService = require('../services/ResponseService');
const _ = require('@sailshq/lodash');
const to = require('await-to-js').default;
const async = require("async");


const calculateShippingAmount = function (ruleObject, value) {
  for (let rule in ruleObject) {
    sails.log.debug(rule, value);
    if (rule.includes('-')) {
      const min = parseFloat(rule.split('-')[0]);
      const max = parseFloat(rule.split('-')[1]);
      if (value >= min && value < max) {
        return ruleObject[rule];
      }
    } else {
      const min = parseFloat(rule);
      if (value >= min) {
        return ruleObject[rule];
      }
    }
  }
  return undefined;
};

const sendMail = async function (account, orderNumber, stateShippingMap, location, body, trackingLink, gatewayCharges, subTotalPrice, total, finalShippingAmount, shopUrl, taxes) {
  console.log("sendMail 29");
  let content = await sails.renderView('email/alert-v2', {
    businessName: account.businessName,
    orderId: orderNumber,
    products: stateShippingMap[location],
    shippingInfo: body.shipping_address,
    trackingLink: trackingLink,
    currency: body.currency,
    gatewayCharge: gatewayCharges,
    subtotal: subTotalPrice,
    total: total,
    shippingPrice: finalShippingAmount,
    layout: false,
    shopUrl: shopUrl,
    taxes: taxes.toFixed(2)
  });
  MailService.sendEmailToAccount(account[0].email, `NEW VOLLEY ORDER FOR FULFILLMENT #${orderNumber}`,
    content, true);
};

module.exports = {

  orderWebhook2: async (req, res) => {
  console.log("orderWebhook2_51");
    try {
      const body = req.body;
      // sails.log.debug(JSON.stringify(body));

      const shippingMap = {};
      const productShippingMap = {};
      const stateShippingMap = {};
      const resolvedProductList = [];  //product resolved by product shipping rules
      const lineItems = body['line_items'];
      const orderId = body.id;
      const orderNumber = body.order_number;
      const shippingAddress = body.shipping_address;
      const shopUrl = `https://${process.env.STORE_URL}`;
      const taxAmount = _.sum(body.tax_lines, tax => parseFloat(tax.price));
      // sails.log.debug('Tax amount', taxAmount);

      /**
       * Updating line items with product images, and updating product images in our db
       */
      console.log("orderWebhook2_71");
      for (let item of lineItems) {
        const productId = item.product_id;
        const variantId = item.variant_id;
        const productData = await ProductMeta.findOne({ productId, variantId });
        if (productData) {
          item['image'] = productData.imageUrl;
          item['handle'] = productData.handle;
        }
        else {
          const productInfo = await ShopifyService.getProductMeta(productId, variantId);
          const variantHandle = `${productInfo.handle}`;
          item['image'] = productInfo.imageSrc;
          item['handle'] = variantHandle;
          await ProductMeta.create({ productId, variantId, imageUrl: productInfo.imageSrc, handle: variantHandle });
        }
      }
      console.log("orderWebhook2_88");
      /** Creating product shipping location map { location -> [products]}  */
      const fulfilledByProduct = [];
      for (let item of lineItems) {
        // sails.log.debug('item', item.id);
        const locationData = await LocationHelper.fetchLocationByProductId(item.product_id);
        // sails.log.debug('locationData', locationData);
        if (locationData.length > 0 && item.fulfillable_quantity > 0) {
          const locationId = (locationData[0].locationId);
          fulfilledByProduct.push(item.product_id);
          resolvedProductList.push(item);
          if ((typeof productShippingMap[locationId] === 'undefined')) {
            productShippingMap[locationId] = [item];
          } else {
            productShippingMap[locationId].push(item);
          }
        }
      }
      console.log("orderWebhook2_106");
      const resolvedProductWeight = _.sum(resolvedProductList, item => item.grams);
      /**
       * 1lb = 453.6 grams
       */
      const resolvedWeightInLb = (resolvedProductWeight / 453.6).toFixed(2);
      const resolvedPrice = _.sum(resolvedProductList, item => item.price);
      // sails.log.debug('Weight of product', resolvedWeightInLb);

      /** Calculating shipping cost based for products */
      const deliveryRules = {
        price: {
          '50': 0,
          '0': 0
        },
        weight: {
          '0-5': 4.90,
          '5-70': 19.90
        }
      };
      console.log("orderWebhook2_126");
      let calculatedShippingByPrice = calculateShippingAmount(deliveryRules.price, resolvedPrice);
      // sails.log.debug({ calculatedShippingByPrice });
      if (typeof (calculatedShippingByPrice) === 'undefined') {
        calculatedShippingByPrice = calculateShippingAmount(deliveryRules.weight, resolvedProductWeight).toFixed(2);
      }
      // sails.log.debug({ calculatedShippingByPrice });
      console.log("orderWebhook2_133");
      const shippingAmount = parseFloat(body.total_shipping_price_set.presentment_money.amount).toFixed(2);
      let finalShippingAmount = shippingAmount - calculatedShippingByPrice;
      const shippingStripeCharge = ((0.029) * finalShippingAmount).toFixed(2);
      // sails.log.debug({ calculatedShippingByPrice, shippingAmount, shippingStripeCharge, finalShippingAmount });

      /** NOT USED : Remaining items left after product shippingMap, to be fulfilled by state
      const unfulfilledItems = _.filter(lineItems, item => {
        // if (!(fulfilledByProduct.includes(item.product_id))) {
        return item;
        // }
      });
      */
      console.log("orderWebhook2_146");
      const stateLocationData = await LocationHelper.fetchLocationByState(shippingAddress.province_code);
      for (let item of lineItems) {
        var locationId = '';
        var product_id = item.product_id;

        var stateLocationDetail = _.find(stateLocationData, function (x) { return x.productId == product_id; });
        if (!_.isEmpty(stateLocationDetail)) {
          locationId = (stateLocationDetail.locationId);
        } else {
          const productLocationData = await LocationHelper.fetchLocationByProductId(product_id);
          if (productLocationData.length > 0) {
            locationId = productLocationData[0].locationId;
          }
        }
        console.log("orderWebhook2_161");
        if (!_.isEmpty(locationId)) {
          if ((typeof shippingMap[locationId] === 'undefined')) {
            shippingMap[locationId] = [item];
          } else {
            shippingMap[locationId].push(item);
          }
        }
      }
      console.log("orderWebhook2_170");
      /** Creating fulfillment and sending mail to retailer */
      for (let location in shippingMap) {
        // sails.log.debug('---------------------------------------------------------------------------');
        const itemIds = shippingMap[location].map(x => x.id);
        let subTotalPrice = (_.sum(shippingMap[location], item => (parseFloat(item.price) * item.fulfillable_quantity))).toFixed(2);
        /**
         * Stripe charges for US 2.9% + 30c
         * 2.9 % from shipping remaining (2.9% + 30c) from sub total amount
         */
        var gatewayCharges = ((0.029 * (parseFloat(subTotalPrice) + taxAmount)) + parseFloat(0.30) + parseFloat(shippingStripeCharge)).toFixed(2);
        var subTotal = (subTotalPrice - gatewayCharges).toFixed(2);
        var total = (parseFloat(subTotal) + taxAmount + parseFloat(finalShippingAmount)).toFixed(2);
        const response = await ShopifyService.createFulfilment(orderId, itemIds, parseInt(location));
        const totalWeight = _.sum(shippingMap[location], item => item.weight);
        console.log("orderWebhook2_185",response);
        const account = await Account.find({ locationId: location });
	// console.log("account",account);
        if (!_.isEmpty(account)) {
          const inHouseBusiness = (account[0]) ? account[0].inHouseBusiness : false;

          if (inHouseBusiness) {
            gatewayCharges = 0;
            subTotal = subTotalPrice;
            total = (parseFloat(subTotal) + taxAmount + parseFloat(finalShippingAmount)).toFixed(2);
          }

          const info = await Fulfillment.create({ fulfillmentId: response.data.fulfillment.id, amount: total, status: false, accountId: account[0].id, orderNumber, shopifyOrderId: orderId });
          const trackingLink = `${ConstantService.trackingBaseUrl}${response.data.fulfillment.id}`;
          console.log("orderWebhook2_198 send mail");
          await sendMail(account, orderNumber, shippingMap, location, body, trackingLink, gatewayCharges, subTotalPrice, total, finalShippingAmount, shopUrl, taxAmount);
        }
      }

      return res.ok();

    } catch (e) {
      return ResponseService.error(res, e, 'error processing order');
    }

  },

  syncFulfillment: async (req, res) => {
    try {
      const params = req.allParams();
      let offset = params['offset'];

      const fulfillmentList = await Fulfillment.find({
        where: { shopifyOrderId: null },
        limit: 100,
        skip: (offset - 1) * 100,
      }).sort([{ 'orderNumber': 'ASC' }]);

      for (let i = 0; i < fulfillmentList.length; i++) {
        const fulfillment = fulfillmentList[i];

        const orderData = await ShopifyService.getOrderByNumber(fulfillment.orderNumber);
        const orderId = orderData.data.orders[0].id;
        // console.log("orderId > ", orderId);
        // console.log("fulfillmentId > ", fulfillment.fulfillmentId);

        const fulfillmentId = fulfillment.fulfillmentId;
        const trackingInfo = await ShopifyService.getTrackingDetail(orderId, fulfillmentId);
        let fulfillmentData = {
          shopifyOrderId: orderId
        };

        if (trackingInfo.data.fulfillment.tracking_number) {
          fulfillmentData.shopifyTrackingNumber = trackingInfo.data.fulfillment.tracking_number;
        }

        if (trackingInfo.data.fulfillment.tracking_url) {
          fulfillmentData.shopifyTrackingLink = trackingInfo.data.fulfillment.tracking_url;
        }

        if (trackingInfo.data.fulfillment.updated_at) {
          fulfillmentData.shopifyTrackingTimestamp = trackingInfo.data.fulfillment.updated_at;
        }

        await Fulfillment.update({ fulfillmentId: fulfillmentId }).set(fulfillmentData).then(() => {
          console.log(fulfillment.orderNumber, ' - ' , fulfillment.fulfillmentId, ' - Success');
        });
      }

      return res.ok({ total: fulfillmentList.length, records: fulfillmentList });

    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, 'Unable to fetch fulfillments');
    }
  },


  updateShopifyTrackingdetails: async (req, res) => {
    try {

      let body = req.body;

      console.log(body);

      let fulfillmentId = body.id;
      let shopifyOrderId = body.order_id;
      let shipmentStatus = body.shipment_status;
      let updated_at = body.updated_at;

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
      } else {
        shopifyTrackingStatus = ""
      }

      console.log({fulfillmentId,shopifyOrderId });
      const fulfillment = await Fulfillment.findOne({fulfillmentId,shopifyOrderId });


      let fulfillmentData = {};
      fulfillmentData.shopifyTrackingStatus = shopifyTrackingStatus;
      fulfillmentData.shopifyTrackingUpdateAt = updated_at;


      await Fulfillment.update({ fulfillmentId: fulfillmentId }).set(fulfillmentData).then(() => {
        console.log(fulfillment.orderNumber, ' - ' , fulfillment.fulfillmentId, ' - Success');
      });


      return res.ok({ shopifyTrackingStatus, updated_at });



    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, 'Unable to fetch fulfillments');
    }
  },

  updateTrackingStatusManually: async(req, res) => {
    try {
      const params = req.body;
      let pageSize = params.pageSize;
      let page = params.page;

      let limit = pageSize;

      let where = {limit: limit, skip : (page-1)*pageSize, where : {}};
      let sort = {createdAt : "ASC"};

      console.log(where);
      console.log(sort);

      let fulfillmentList = await Fulfillment.find(where).sort([sort]);

      for (let index = 0; index < fulfillmentList.length; index++) {
        const element = fulfillmentList[index];

        const trackingInfo = await ShopifyService.getTrackingDetailmanually(element.shopifyOrderId, element.fulfillmentId, element.id);
        if(trackingInfo.status && trackingInfo.data && trackingInfo.data.data && trackingInfo.data.data.fulfillment){
          let fulfillment = trackingInfo.data.data.fulfillment
          let fulfillmentId = trackingInfo.origional.fulfillmentId;

          let shipmentStatus = fulfillment.shipment_status;
          let updated_at = fulfillment.updated_at;

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
          } else {
            shopifyTrackingStatus = ""
          }

          let fulfillmentData = {};
          fulfillmentData.shopifyTrackingStatus = shopifyTrackingStatus;
          fulfillmentData.shopifyTrackingUpdateAt = updated_at;

          await Fulfillment.update({ fulfillmentId: fulfillmentId }).set(fulfillmentData).then(() => {
            console.log(fulfillment.order_id, ' - ' , fulfillment.id, ' - Success', index);
          });
        }

      }

      return res.ok(fulfillmentList);

    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, 'Unable to fetch fulfillments');
    }
  },

  updateStatusOfFulFillmentToSucccess: async(req, res) => {
    try {
      const params = req.body;

      let where = {"where" : {"status": 0}};
      let sort = {"orderNumber" : "DESC"};

      let orderArray = [2992, 2990, 2989,2988,2987,2986,2984,2983,2980, 2957, 2944, 1929]

      console.log(where);
      console.log(sort);

      let fulfillmentList = await Fulfillment.find(where).sort([sort]);

      let successArray = [];

      for (let index = 0; index < fulfillmentList.length; index++) {
        const element = fulfillmentList[index];


        if(orderArray.indexOf(parseInt(element.orderNumber)) > -1){
          const trackingInfo = await ShopifyService.getTrackingDetailmanually(element.shopifyOrderId, element.fulfillmentId, element.id);
          if(trackingInfo.status && trackingInfo.data && trackingInfo.data.data && trackingInfo.data.data.fulfillment){
            successArray.push(trackingInfo.data.data);
            let fulfillment = trackingInfo.data.data.fulfillment
            let fulfillmentId = trackingInfo.origional.fulfillmentId;

            let shipmentStatus = fulfillment.shipment_status;
            let updated_at = fulfillment.updated_at;

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
            } else {
              shopifyTrackingStatus = ""
            }

            let fulfillmentData = {};
            fulfillmentData.shopifyTrackingStatus = shopifyTrackingStatus;
            fulfillmentData.shopifyTrackingUpdateAt = updated_at;
            fulfillmentData.status = true;
            fulfillmentData.transferStatus = true;
            fulfillmentData.transferComment = 'Payout created';
            fulfillmentData.shopifyTrackingNumber = fulfillment.tracking_number;
            fulfillmentData.shopifyTrackingLink = fulfillment.tracking_url;
            fulfillmentData.shopifyTrackingTimestamp = fulfillment.updated_at;

            await Fulfillment.update({ fulfillmentId: fulfillmentId }).set(fulfillmentData).then(() => {
              console.log(fulfillment.order_id, ' - ' , fulfillment.id, ' - Success', index);
            });

            const accountInfo = await Account.find({ id: element.accountId });
            if(accountInfo){
              let payoutData = {
                orderNumber: parseInt(element.orderNumber),
                amount: element.amount,
                retailerName: accountInfo[0].businessName,
                destination: accountInfo[0].accountId
              }

              await Payout.create(payoutData);
              console.log(payoutData);
            }
          }
        }
      }

      return res.ok(successArray);
    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, 'Unable to fetch fulfillments');
    }
  }


};
