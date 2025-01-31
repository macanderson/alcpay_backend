const LocationHelper = require("../services/LocationHelper");
const ShopifyService = require("../services/ShopifyService");
const ResponseService = require("../services/ResponseService");
const EncryptionService = require("../services/EncryptionService");
const _ = require("@sailshq/lodash");
const to = require("await-to-js").default;
const async = require("async");
const axios = require("axios");

// const BASE_URL = `https://${sails.config.custom.STORE_ACCESS_ID}:${sails.config.custom.STORE_PASSWORD}@${sails.config.custom.STORE_URL}/admin/api/${sails.config.custom.API_VERSION}/`;
// const base_url = `https://${sails.config.custom.STORE_URL}/admin/api/2020-10/`;

const calculateShippingAmount = function (ruleObject, value) {
  for (let rule in ruleObject) {
    sails.log.debug(rule, value);
    if (rule.includes("-")) {
      const min = parseFloat(rule.split("-")[0]);
      const max = parseFloat(rule.split("-")[1]);
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

const sendMail = async function (
  account,
  orderNumber,
  stateShippingMap,
  location,
  body,
  trackingLink,
  gatewayCharges,
  subTotalPrice,
  total,
  finalShippingAmount,
  shopUrl,
  taxes
) {
  console.log("sendMail 29");
  let content = await sails.renderView("email/alert-v2", {
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
    taxes: taxes.toFixed(2),
  });

  /* if (account && account[0] && account[0].email) {
	         console.log("account[0].email",account[0].email);
	if (account[0].email == "info@mashbillwineandspirits.com" || account[0].email == "info@vistawinespirits.com") {
		 console.log("Email not send to info@mashbillwineandspirits.com or info@vistawinespirits.com retailer");
	} else {
		MailService.sendEmailToAccount(account[0].email, `NEW VOLLEY ORDER FOR FULFILLMENT #${orderNumber}`,
			content, true);
	    };
        }*/

  if (account && account[0] && account[0].email) {
    console.log("account[0].email", account[0].email);
    if (
      account[0].email == "info@mashbillwineandspirits.com" ||
      account[0].email == "info@vistawinespirits.com" ||
      account[0].id == 26 ||
      account[0].id == 27 ||
      account[0].email == "amelsoro@vistawinespirits.com"
    ) {
      console.log(
        "Email not send to info@mashbillwineandspirits.com or info@vistawinespirits.com retailer"
      );
      MailService.sendEmailToAccount(
        "volley@wholesomespirits.com",
        `NEW VOLLEY ORDER FOR FULFILLMENT #${orderNumber}`,
        content,
        true
      );
    } else {
      MailService.sendEmailToAccount(
        account[0].email,
        `NEW VOLLEY ORDER FOR FULFILLMENT #${orderNumber}`,
        content,
        true
      );
    }
  }
  /* MailService.sendEmailToAccount(account[0].email, `NEW VOLLEY ORDER FOR FULFILLMENT #${orderNumber}`,
    content, true);*/
};

// module.exports = {
//   orderWebhook2: async (req, res) => {
//     console.log("orderWebhook2_51");
//     try {
//       const body = req.body;
//       console.log("|||||||||||||||||||||||||||||||||");
//       sails.log.debug("|||||||||||||||||||||||||||||||||");
//       // console.log(JSON.stringify(body));
//       sails.log.debug(JSON.stringify(body));
//       console.log("|||||||||||||||||||||||||||||||||");
//       sails.log.debug("|||||||||||||||||||||||||||||||||");

//       const shippingMap = {};
//       const productShippingMap = {};
//       const stateShippingMap = {};
//       const resolvedProductList = []; //product resolved by product shipping rules
//       const lineItems = body["line_items"];
//       const orderId = body.id;
//       const orderNumber = body.order_number;
//       const shippingAddress = body.shipping_address;

//       // Extract Shopify store URL from `order_status_url` field in the req.body
//       // example => "https://volley.myshopify.com/72926822645/orders/123456abcd/authenticate?key=abcdefg"
//       // we can extract the STORE_URL from it using regex , example => volley.myshopify.com
//       // This way there is no need to get it by decrypting the encrypted store details of brand

//       const orderStatusUrl = body.order_status_url;
//       // const storeUrlMatch = orderStatusUrl.match(/https:\/\/(.*?.com)/);
//       const storeUrlMatch = orderStatusUrl.match(/https:\/\/(.*?.myshopify.com)/);
      
//       if (!storeUrlMatch || storeUrlMatch.length === 0) {
//         throw new Error("Shopify store URL not found in order_status_url");
//       }
//       const storeUrl = storeUrlMatch[1];
//       console.log("Extracted Shopify Store URL:", storeUrl);

//       // Fetch the brand based on storeName (storeUrl)
//       const brand = await Brands.findOne({ storeName: storeUrl });
//       if (!brand) {
//         throw new Error(`No brand found with storeName: ${storeUrl}`);
//       }
//       const brandId = brand.id;
//       console.log("Associated Brand ID:", brandId);


//       const decryptedData =
//         await ShopifyService.getBrandsDecryptedDataFromStoreName(storeUrl);
//       const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
//       console.log("BASE_URL", BASE_URL);

//       const taxAmount = _.sum(body.tax_lines, (tax) => parseFloat(tax.price));
//       // sails.log.debug('Tax amount', taxAmount);
//       console.log("shipping address", shippingAddress);
module.exports = {
  /**
   * Handle Order Webhook
   * API Endpoint :   /webhook/order
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing order data from Shopify.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 or relevant error code with message.
   */
  orderWebhook2: async (req, res) => {
    console.log("orderWebhook2_51");
    try {
      sails.log.info("====================== ORDER WEBHOOK REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const body = req.body;
      // console.log("|||||||||||||||||||||||||||||||||");
      // console.log(JSON.stringify(body));
      // console.log("|||||||||||||||||||||||||||||||||");
      sails.log.debug("|||||||||||||||||||||||||||||||||");
      sails.log.debug(JSON.stringify(body));
      sails.log.debug("|||||||||||||||||||||||||||||||||");

      const shippingMap = {};
      const productShippingMap = {};
      const stateShippingMap = {};
      const resolvedProductList = []; //product resolved by product shipping rules
      const lineItems = body["line_items"];
      const orderId = body.id;
      const orderNumber = body.order_number;
      const shippingAddress = body.shipping_address;


      // const storeUrl = req.headers['x-shopify-shop-domain'];
      // if (!storeUrl) {
      //   throw new Error("Missing X-Shopify-Shop-Domain header");
      // }
      // console.log("Extracted Shopify Store Name ===> ", storeUrl);
      
      
      
      let storeUrl = body.storeName;
      console.log("storeName ",storeUrl);
      if (!storeUrl) { // if no storeName in req body, try to get it from shopify's webhook header 
        storeUrl = req.headers['x-shopify-shop-domain'];
        if (!storeUrl) {
          throw new Error("Missing X-Shopify-Shop-Domain header");
        }
      }
        
      console.log("Extracted Shopify Store Name ===> ", storeUrl);

      // Fetch the brand based on storeName (storeUrl)
      const brand = await Brands.findOne({ storeName: storeUrl });
      if (!brand) {
        throw new Error(`No brand found with storeUrl: ${storeUrl}`);
      }
      const brandId = brand.id;
      console.log("Associated Brand ID:", brandId);


      const decryptedData =
        await ShopifyService.getBrandsDecryptedDataFromStoreName(storeUrl);
      const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
      const base_url = EncryptionService.decryptDataToBase_url(decryptedData);
      console.log("BASE_URL", BASE_URL);

      const taxAmount = _.sum(body.tax_lines, (tax) => parseFloat(tax.price));
      // sails.log.debug('Tax amount', taxAmount);
      console.log("shipping address", shippingAddress);
      /**
       * Updating line items with product images, and updating product images in our db
       */

      console.log("orderWebhook2_71", lineItems);
      for (let item of lineItems) {
        const productId = item.product_id;
        const variantId = item.variant_id;
        const productData = await ProductMeta.findOne({ productId, variantId });
        if (productData) {
          item["image"] = productData.imageUrl;
          item["handle"] = productData.handle;
        } else {
          const productInfo = await ShopifyService.getProductMeta(
            BASE_URL,
            productId,
            variantId
          );
          const variantHandle = `${productInfo.handle}`;
          item["image"] = productInfo.imageSrc;
          item["handle"] = variantHandle;
          await ProductMeta.create({
            productId,
            variantId,
            imageUrl: productInfo.imageSrc,
            handle: variantHandle,
            brand_id: brandId,
          });
        }
      }

      console.log("orderWebhook2_88");
      /** Creating product shipping location map { location -> [products] } */
      const fulfilledByProduct = [];
      for (let item of lineItems) {
        const productId = item.product_id;

        // Updated: Fetch locations by product ID using the new model structure
        const locationData = await LocationHelper.fetchLocationByProductId(
          productId
        );
        console.log("locationData ", locationData);
        
        if (locationData.length > 0 && item.fulfillable_quantity > 0) {
          const locationId = locationData[0].locationId;
          fulfilledByProduct.push(productId);
          resolvedProductList.push(item);
          if (!(locationId in productShippingMap)) {
            productShippingMap[locationId] = [item];
          } else {
            productShippingMap[locationId].push(item);
          }
        }
      }
      console.log("orderWebhook2_106");

      const resolvedProductWeight = _.sum(
        resolvedProductList,
        (item) => item.grams
      );
      const resolvedWeightInLb = (resolvedProductWeight / 453.6).toFixed(2);
      const resolvedPrice = _.sum(resolvedProductList, (item) => item.price);

      /** Calculating shipping cost based on products */
      const deliveryRules = {
        price: {
          50: 0,
          0: 0,
        },
        weight: {
          "0-5": 4.9,
          "5-70": 19.9,
        },
      };
      console.log("orderWebhook2_126");
      let calculatedShippingByPrice = calculateShippingAmount(
        deliveryRules.price,
        resolvedPrice
      );
      if (typeof calculatedShippingByPrice === "undefined") {
        calculatedShippingByPrice = calculateShippingAmount(
          deliveryRules.weight,
          resolvedProductWeight
        ).toFixed(2);
      }
      console.log("orderWebhook2_133");
      const shippingAmount = parseFloat(
        body.total_shipping_price_set.presentment_money.amount
      ).toFixed(2);
      let finalShippingAmount = shippingAmount - calculatedShippingByPrice;
      const shippingStripeCharge = (0.029 * finalShippingAmount).toFixed(2);
      console.log("orderWebhook2_146");

      const stateLocationData = await LocationHelper.fetchLocationByState(
        shippingAddress.province_code
      );
      console.log("orderWebhook2_ stateLocationData", stateLocationData);

      for (let item of lineItems) {
        let locationId = "";
        const product_id = item.product_id;

        // Updated: Fetch location detail based on new structure
        const stateLocationDetail = _.find(stateLocationData, function (x) {
          // Check if any product in the products array matches the product_id
          return x.products.some((product) => product.id === product_id);
        });
        console.log("stateLocationDetail", stateLocationDetail);
        if (!_.isEmpty(stateLocationDetail)) {
          console.log("stateLocationDetail IF", stateLocationDetail.locationId);
          locationId = stateLocationDetail.locationId;
        } else {
          console.log("stateLocationDetail else", product_id);
          // Updated: Fetch location by product ID using the new model structure
          const productLocationData =
            await LocationHelper.fetchLocationByProductId(product_id);
          console.log("productLocationData else", productLocationData);
          if (productLocationData.length > 0) {
            locationId = productLocationData[0].locationId;
          }
        }
        console.log("orderWebhook2_161", locationId);
        if (!_.isEmpty(locationId)) {
          if (!(locationId in shippingMap)) {
            shippingMap[locationId] = [item];
          } else {
            shippingMap[locationId].push(item);
          }
        }
      }
      console.log("orderWebhook2_170", shippingMap);

      /** Creating fulfillment and sending mail to retailer */

      for (let location in shippingMap) {
        console.log("location", location);
        let itemIds = shippingMap[location].map((x) => x.id);
        console.log("itemIds", itemIds);
        let subTotalPrice = _.sum(
          shippingMap[location],
          (item) => parseFloat(item.price) * item.fulfillable_quantity
        ).toFixed(2);

        var gatewayCharges = (
          0.029 * (parseFloat(subTotalPrice) + taxAmount) +
          parseFloat(0.3) +
          parseFloat(shippingStripeCharge)
        ).toFixed(2);
        var subTotal = (subTotalPrice - gatewayCharges).toFixed(2);
        var total = (
          parseFloat(subTotal) +
          taxAmount +
          parseFloat(finalShippingAmount)
        ).toFixed(2);
        //const response = await ShopifyService.createFulfilment(orderId, itemIds, parseInt(location));

        // Updated: Create fulfillment using the new model structure

        let response;
        console.log("itemIds response", itemIds);
        let line_items = [];
        itemIds.forEach((x) => line_items.push({ id: parseInt(x) }));
        console.log("line_items", line_items);
        const fulfillmentObject = {
          fulfillment: {
            location_id: parseInt(location),
            tracking_number: null,
            line_items,
            notify_customer: false,
          },
        };

        const url = BASE_URL + `orders/${orderId}/fulfillment_orders.json`;

        console.log("Webcontroller_url", url);
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: url,
          headers: {
            "X-Shopify-Access-Token": `${decryptedData.STORE_PASSWORD}`,
          },
        };

        try {
          await axios
            .request(config)
            .then(async (response_fulfillment_order) => {
              let line_itemsData = [];
              console.log(
                "Webcontroller_response_fulfillment_order",
                response_fulfillment_order.data.fulfillment_orders
              );
              response_fulfillment_order.data.fulfillment_orders.forEach(
                (element) => {
                  console.log("element.lineitems", element.line_items);
                  let shippingData = shippingMap[location];
                  let matchingItems = element.line_items.filter((item) =>
                    shippingData.some(
                      (dataItem) => dataItem.variant_id === item.variant_id
                    )
                  );

                  console.log("matchingItems", matchingItems);
                  console.log("matchingItems.length", matchingItems.length);

                  if (matchingItems.length > 0) {
                    console.log(
                      "element.lineitems shippingmap",
                      element.line_items
                    );
                    line_itemsData.push({
                      fulfillment_order_id: element.id,
                      // Updated: Pass matchingItems instead of element.line_items
                      fulfillment_order_line_items: matchingItems,
                    });
                  }
                }
              );

              console.log("line_itemsData", line_itemsData);

              let data = {
                fulfillment: {
                  location_id: parseInt(location),
                  tracking_number: null,
                  notify_customer: false,
                  line_items_by_fulfillment_order: line_itemsData,
                },
              };

              console.log("DATA fulfillment", data);
              const urlPost = base_url + `fulfillments.json`; 

              console.log("Webcontroller_url post", urlPost);
              console.log("Webcontroller_url post data", data);

              let configPost = {
                method: "post",
                maxBodyLength: Infinity,
                url: urlPost,
                headers: {
                  "X-Shopify-Access-Token": `${decryptedData.STORE_PASSWORD}`,
                  "Content-Type": "application/json",
                },
                data: data,
              };

              await axios
                .request(configPost)
                .then((response_fulfillment) => {
                  response = response_fulfillment;
                })
                .catch((error) => {
                  console.log("==>Error", error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        } catch (error) {
          console.log("catch");
          console.log("error", error);
        }

        console.log("response 188 createFulfilment", response);
        const totalWeight = _.sum(shippingMap[location], (item) => item.weight);
        console.log("orderWebhook2_185", location);
        const account = await Account.find({ locationId: location });

        console.log("account", account);
        if (!_.isEmpty(account)) {
          const inHouseBusiness = account[0]
            ? account[0].inHouseBusiness
            : false;

          if (inHouseBusiness) {
            gatewayCharges = 0;
            subTotal = subTotalPrice;
            total = (
              parseFloat(subTotal) +
              taxAmount +
              parseFloat(finalShippingAmount)
            ).toFixed(2);
          }

          // Updated: Include brandId when creating fulfillment
          const info = await Fulfillment.create({
            fulfillmentId: response.data.fulfillment.id,
            amount: total,
            status: false,
            accountId: account[0].id,
            orderNumber,
            shopifyOrderId: orderId,
            brandId: brandId, // Associate fulfillment with brand
          }).fetch();
          console.log("fulfillment info",info);
          
          const trackingLink = `${ConstantService.trackingBaseUrl}${response.data.fulfillment.id}`;
          console.log("orderWebhook2_198 send mail");
          await sendMail(
            account,
            orderNumber,
            shippingMap,
            location,
            body,
            trackingLink,
            gatewayCharges,
            subTotalPrice,
            total,
            finalShippingAmount,
            storeUrl,
            taxAmount
          );
        }
      }

      return res.ok();
    } catch (e) {
      console.error("Error in orderWebhook2:", e);
      return ResponseService.error(res, e, "Error processing order");
    }
  },

  /**
   * Sync Fulfillment Status
   * API Endpoint :   /sync-fulfillment
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and sync status or relevant error code with message.
   */
  syncFulfillment: async (req, res) => {
    try {
      sails.log.info("====================== SYNC FULFILLMENT REQUEST ==============================\n");
      const params = req.allParams();
      console.log("params ",params);

      let offset = params["offset"];
      // please provide store name so the backend knows which brand's shopify store credentials should be use
      // example "storeName":"volley.myshopify.com"
      let storeName = params.storeName;
      console.log("storeName ",storeName);
      if (!storeName) { // if no storeName in req param, try to get it from shopify's webhook header 
        storeName = req.headers['x-shopify-shop-domain'];
        if (!storeName) {
          throw new Error("Missing X-Shopify-Shop-Domain header");
      }
      console.log("Extracted Shopify Store Name ===> ", storeName);
      }
      const decryptedData =await ShopifyService.getBrandsDecryptedDataFromStoreName(storeName);
      const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);

      const fulfillmentList = await Fulfillment.find({
        where: { shopifyOrderId: null },
        limit: 100,
        skip: Number((offset - 1) * 100),
      }).sort([{ orderNumber: "ASC" }]);

      for (let i = 0; i < fulfillmentList.length; i++) {
        const fulfillment = fulfillmentList[i];

        const orderData = await ShopifyService.getOrderByNumber(
          BASE_URL,
          fulfillment.orderNumber
        );
        const orderId = orderData.data.orders[0].id;
        // console.log("orderId > ", orderId);
        // console.log("fulfillmentId > ", fulfillment.fulfillmentId);

        const fulfillmentId = fulfillment.fulfillmentId;
        const trackingInfo = await ShopifyService.getTrackingDetail(
          BASE_URL,
          orderId,
          fulfillmentId
        );
        console.log("trackingInfo", trackingInfo);
        let fulfillmentData = {
          shopifyOrderId: orderId,
        };

        if (trackingInfo.data.fulfillment.tracking_number) {
          fulfillmentData.shopifyTrackingNumber =
            trackingInfo.data.fulfillment.tracking_number;
        }

        if (trackingInfo.data.fulfillment.tracking_url) {
          fulfillmentData.shopifyTrackingLink =
            trackingInfo.data.fulfillment.tracking_url;
        }

        if (trackingInfo.data.fulfillment.updated_at) {
          fulfillmentData.shopifyTrackingTimestamp =
            trackingInfo.data.fulfillment.updated_at;
        }

        await Fulfillment.update({ fulfillmentId: fulfillmentId })
          .set(fulfillmentData)
          .then(() => {
            console.log(
              fulfillment.orderNumber,
              " - ",
              fulfillment.fulfillmentId,
              " - Success"
            );
          });
      }

      return res.ok({
        total: fulfillmentList.length,
        records: fulfillmentList,
      });
    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, "Unable to fetch fulfillments");
    }
  },

  /**
   * Update Shopify Tracking Details
   * API Endpoint :   /webhook/update-fulfillment-tracking-status
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing tracking details.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and update status or relevant error code with message.
   */
  updateShopifyTrackingdetails: async (req, res) => {
    try {
      sails.log.info("====================== UPDATE SHOPIFY TRACKING DETAILS REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      let body = req.body;

      console.log(body);

      let fulfillmentId = body.id;
      let shopifyOrderId = body.order_id;
      let shipmentStatus = body.shipment_status;
      let updated_at = body.updated_at;

      var shopifyTrackingStatus = "-";

      if (shipmentStatus === "label_printed") {
        shopifyTrackingStatus = "Label Printed";
      } else if (shipmentStatus === "label_purchased") {
        shopifyTrackingStatus = "Label Purchased";
      } else if (shipmentStatus === "attempted_delivery") {
        shopifyTrackingStatus = "Attempted Delivery";
      } else if (shipmentStatus === "ready_for_pickup") {
        shopifyTrackingStatus = "Ready For Pickup";
      } else if (shipmentStatus === "confirmed") {
        shopifyTrackingStatus = "Confirmed";
      } else if (shipmentStatus === "in_transit") {
        shopifyTrackingStatus = "In Transit";
      } else if (shipmentStatus === "out_for_delivery") {
        shopifyTrackingStatus = "Out For Delivery";
      } else if (shipmentStatus === "delivered") {
        shopifyTrackingStatus = "Delivered";
      } else if (shipmentStatus === "failure") {
        shopifyTrackingStatus = "Failure";
      } else {
        shopifyTrackingStatus = "";
      }

      console.log({ fulfillmentId, shopifyOrderId });
      const fulfillment = await Fulfillment.findOne({
        fulfillmentId,
        shopifyOrderId,
      });

      let fulfillmentData = {};
      fulfillmentData.shopifyTrackingStatus = shopifyTrackingStatus;
      fulfillmentData.shopifyTrackingUpdateAt = updated_at;

      await Fulfillment.update({ fulfillmentId: fulfillmentId })
        .set(fulfillmentData)
        .then(() => {
          console.log(
            fulfillment.orderNumber,
            " - ",
            fulfillment.fulfillmentId,
            " - Success"
          );
        });

      return res.ok({ shopifyTrackingStatus, updated_at });
    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, "Unable to fetch fulfillments");
    }
  },

  /**
   * Update Tracking Status Manually
   * API Endpoint :   /webhookAPI/update-status-manually
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing tracking status.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and update status or relevant error code with message.
   */
  updateTrackingStatusManually: async (req, res) => {
    try {
      sails.log.info("====================== UPDATE TRACKING STATUS MANUALLY REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const params = req.body;

      let pageSize = params.pageSize;
      let page = params.page;

      let limit = pageSize;

      let where = { limit: limit, skip: (page - 1) * pageSize, where: {} };
      let sort = { createdAt: "ASC" };

      console.log(where);
      console.log(sort);

      let fulfillmentList = await Fulfillment.find(where).sort([sort]);

      for (let index = 0; index < fulfillmentList.length; index++) {
        const element = fulfillmentList[index];

        const trackingInfo = await ShopifyService.getTrackingDetailmanually(
          element.shopifyOrderId,
          element.fulfillmentId,
          element.id
        );
        console.log(
          "trackingInfo ShopifyService.getTrackingDetailmanually",
          trackingInfo
        );
        if (
          trackingInfo.status &&
          trackingInfo.data &&
          trackingInfo.data.data &&
          trackingInfo.data.data.fulfillment
        ) {
          let fulfillment = trackingInfo.data.data.fulfillment;
          let fulfillmentId = trackingInfo.origional.fulfillmentId;

          let shipmentStatus = fulfillment.shipment_status;
          let updated_at = fulfillment.updated_at;

          var shopifyTrackingStatus = "-";

          if (shipmentStatus === "label_printed") {
            shopifyTrackingStatus = "Label Printed";
          } else if (shipmentStatus === "label_purchased") {
            shopifyTrackingStatus = "Label Purchased";
          } else if (shipmentStatus === "attempted_delivery") {
            shopifyTrackingStatus = "Attempted Delivery";
          } else if (shipmentStatus === "ready_for_pickup") {
            shopifyTrackingStatus = "Ready For Pickup";
          } else if (shipmentStatus === "confirmed") {
            shopifyTrackingStatus = "Confirmed";
          } else if (shipmentStatus === "in_transit") {
            shopifyTrackingStatus = "In Transit";
          } else if (shipmentStatus === "out_for_delivery") {
            shopifyTrackingStatus = "Out For Delivery";
          } else if (shipmentStatus === "delivered") {
            shopifyTrackingStatus = "Delivered";
          } else if (shipmentStatus === "failure") {
            shopifyTrackingStatus = "Failure";
          } else {
            shopifyTrackingStatus = "";
          }

          let fulfillmentData = {};
          fulfillmentData.shopifyTrackingStatus = shopifyTrackingStatus;
          fulfillmentData.shopifyTrackingUpdateAt = updated_at;

          await Fulfillment.update({ fulfillmentId: fulfillmentId })
            .set(fulfillmentData)
            .then(() => {
              console.log(
                fulfillment.order_id,
                " - ",
                fulfillment.id,
                " - Success",
                index
              );
            });
        }
      }

      return res.ok(fulfillmentList);
    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, "Unable to fetch fulfillments");
    }
  },

  /**
   * Update Fulfillment Status to Success
   * API Endpoint :   /webhookAPI/update-status-to-success
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing fulfillment data.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and update status or relevant error code with message.
   */
  updateStatusOfFulFillmentToSucccess: async (req, res) => {
    try {
      sails.log.info("====================== UPDATE FULFILLMENT STATUS TO SUCCESS REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const params = req.body;

      let where = { where: { status: 0 } };
      let sort = { orderNumber: "DESC" };

      let orderArray = [
        2992, 2990, 2989, 2988, 2987, 2986, 2984, 2983, 2980, 2957, 2944, 1929,
      ];

      console.log(where);
      console.log(sort);

      let fulfillmentList = await Fulfillment.find(where).sort([sort]);

      let successArray = [];

      for (let index = 0; index < fulfillmentList.length; index++) {
        const element = fulfillmentList[index];

        if (orderArray.indexOf(parseInt(element.orderNumber)) > -1) {
          const trackingInfo = await ShopifyService.getTrackingDetailmanually(
            element.shopifyOrderId,
            element.fulfillmentId,
            element.id
          );
          console.log("trackingInfo ShopifyService.getTrackingDetailmanually");
          if (
            trackingInfo.status &&
            trackingInfo.data &&
            trackingInfo.data.data &&
            trackingInfo.data.data.fulfillment
          ) {
            console.log("trackingInfo.data.data", trackingInfo.data.data);
            successArray.push(trackingInfo.data.data);
            let fulfillment = trackingInfo.data.data.fulfillment;
            let fulfillmentId = trackingInfo.origional.fulfillmentId;

            let shipmentStatus = fulfillment.shipment_status;
            let updated_at = fulfillment.updated_at;

            var shopifyTrackingStatus = "-";

            if (shipmentStatus === "label_printed") {
              shopifyTrackingStatus = "Label Printed";
            } else if (shipmentStatus === "label_purchased") {
              shopifyTrackingStatus = "Label Purchased";
            } else if (shipmentStatus === "attempted_delivery") {
              shopifyTrackingStatus = "Attempted Delivery";
            } else if (shipmentStatus === "ready_for_pickup") {
              shopifyTrackingStatus = "Ready For Pickup";
            } else if (shipmentStatus === "confirmed") {
              shopifyTrackingStatus = "Confirmed";
            } else if (shipmentStatus === "in_transit") {
              shopifyTrackingStatus = "In Transit";
            } else if (shipmentStatus === "out_for_delivery") {
              shopifyTrackingStatus = "Out For Delivery";
            } else if (shipmentStatus === "delivered") {
              shopifyTrackingStatus = "Delivered";
            } else if (shipmentStatus === "failure") {
              shopifyTrackingStatus = "Failure";
            } else {
              shopifyTrackingStatus = "";
            }

            let fulfillmentData = {};
            fulfillmentData.shopifyTrackingStatus = shopifyTrackingStatus;
            fulfillmentData.shopifyTrackingUpdateAt = updated_at;
            fulfillmentData.status = true;
            fulfillmentData.transferStatus = true;
            fulfillmentData.transferComment = "Payout created";
            fulfillmentData.shopifyTrackingNumber = fulfillment.tracking_number;
            fulfillmentData.shopifyTrackingLink = fulfillment.tracking_url;
            fulfillmentData.shopifyTrackingTimestamp = fulfillment.updated_at;

            await Fulfillment.update({ fulfillmentId: fulfillmentId })
              .set(fulfillmentData)
              .then(() => {
                console.log(
                  fulfillment.order_id,
                  " - ",
                  fulfillment.id,
                  " - Success",
                  index
                );
              });

            const accountInfo = await Account.find({ id: element.accountId });
            if (accountInfo) {
              let payoutData = {
                orderNumber: parseInt(element.orderNumber),
                amount: element.amount,
                retailerName: accountInfo[0].businessName,
                destination: accountInfo[0].accountId,
              };

              await Payout.create(payoutData);
              console.log(payoutData);
            }
          }
        }
      }

      return res.ok(successArray);
    } catch (e) {
      // sails.log.error('Error transferring ', e);
      return ResponseService.error(res, e, "Unable to fetch fulfillments");
    }
  },
};
