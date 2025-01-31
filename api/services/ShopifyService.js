const axios = require('axios');
const Constants = require('../../config/constants');
const LocationHelper = require('./LocationHelper');

// const BASE_URL = `https://${sails.config.custom.STORE_ACCESS_ID}:${sails.config.custom.STORE_PASSWORD}@${sails.config.custom.STORE_URL}/admin/api/${sails.config.custom.API_VERSION}/`;
// const base_url = `https://${sails.config.custom.STORE_URL}/admin/api/2020-10/`;


module.exports = {
 // DONE 
    getAllOrders: async(BASE_URL, pageInfo, limit) => {
        const url = BASE_URL + `orders.json?limit=${limit}&page_info=${pageInfo}`;
        return await axios.get(url);
    },

    // DONE 
    getOrderDetails: async(BASE_URL, orderId) => {
        const url = BASE_URL + `orders/${orderId}.json`;
        return await axios.get(url);
    },
// DONE
    getFulfillmentDetails: async(BASE_URL, orderId) => {
        const url = BASE_URL + `orders/${orderId}/fulfillment_orders.json`;
        return await axios.get(url);
    },
// DONE
    addTracking: async(BASE_URL, fulfillmentId, trackingNo, trackingUrl, shippingService) => {
        console.log("=======================================================addTracking");
        const url = BASE_URL + `fulfillments/${fulfillmentId}/update_tracking.json`;
        const data = {
            'fulfillment': {
                'notify_customer': true,
                'tracking_info': {
                    'number': trackingNo,
                    'url': trackingUrl,
                    'company': shippingService
                }
            }
        };
        return await axios.post(url, data);
    },

//done 
  createFulfilment: async (STORE_PASSWORD, BASE_URL, orderId, lineItemsArray, locationId) => {
    console.log("createFulfilment 40");
    let line_items = [];
    lineItemsArray.forEach((x) => line_items.push({ id: parseInt(x) }));
    console.log("line_items", line_items);
    const fulfillmentObject = {
      fulfillment: {
        location_id: locationId,
        tracking_number: null,
        // eslint-disable-next-line camelcase
        line_items,
        notify_customer: false,
      },
    };

    const url = BASE_URL + `orders/${orderId}/fulfillment_orders.json`;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: url,
      headers: {
        "X-Shopify-Access-Token": STORE_PASSWORD,
      },
    };

    console.log("URL", url);
    console.log("fulfillmentObject", fulfillmentObject);

    /**
     *
     * To send add tracking link details fulfillment id and order id need to be part of url , response body format in below link,
     * https://shopify.dev/docs/admin-api/rest/reference/shipping-and-fulfillment/fulfillment?api[version]=2020-04#createV2-2020-04
     */

    try {
      await axios
        .request(config)
        .then(async (response_fulfillment_order) => {
          console.log(
            "response_fulfillment_order",
            response_fulfillment_order.data
          );
          let line_itemsData = [];
          response_fulfillment_order.data.fulfillment_orders.forEach(
            (element) => {
              line_itemsData.push({
                fulfillment_order_id: element.id,
                // fulfillment_order_line_items: line_items
                fulfillment_order_line_items: element.line_items,
              });
            }
          );

          let data = {
            fulfillment: {
              location_id: locationId,
              tracking_number: null,
              notify_customer: false,
              line_items_by_fulfillment_order: line_itemsData,
            },
          };

          // console.log("data", data);
          const urlPost = base_url + `fulfillments.json`;

          let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: urlPost,
            headers: {
              "X-Shopify-Access-Token": STORE_PASSWORD,
              "Content-Type": "application/json",
            },
            data: data,
          };

          await axios
            .request(config)
            .then((response) => {
              console.log("==================", JSON.stringify(response.data));
              return response;
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });

      // console.log("try");
      // return axios.post(url, fulfillmentObject);

      // axios.post(url,{},headers).then((res) => {

      //     console.log("RES",res);
      //     //   return resolve({status: true, data: res, origional: obj});
      // }).catch((e) => {
      //     console.log("E",e);
      // //   return resolve({status: false})
      // });
    } catch (error) {
      console.log("catch");
      console.log("error", error);
    }

    // sails.log.debug(url, JSON.stringify(fulfillmentObject));
  },

    sendFulfilmentMailVendor: async(fulfillmentId) => {

    },

    sendTrackingMailCustomer: async(fulfillmentId) => {

    },

    fetchLocations: async(BASE_URL ) => {
        sails.log.info('fetching locations');
        const url = BASE_URL + 'locations.json';
        sails.log.info(url);
        return await axios.get(url);
    },

    getProductList: async(BASE_URL) => {
        sails.log.info('Fetching products');
        const url = BASE_URL + 'products.json';
        sails.log.debug(url);
        return await axios.get(url);
    },
//DONE
    getProductMeta: async(BASE_URL, productId, variantId) => {
        const url = BASE_URL + `products/${productId}.json?fields=images,handle`;
        const data = await axios.get(url);
        let imageSrc = '';
        const images = data.data.product.images;
        const handle = data.data.product.handle + `?variant=${variantId}`;
        const matchingImages = images.filter(img => img.variant_ids.includes(parseInt(variantId)));
        if (!_.isEmpty(matchingImages)) {
            imageSrc = matchingImages[0].src;
        } else {
            if (!_.isEmpty(images)) {
                imageSrc = images[0].src;
            }
        }
        return { imageSrc, handle };
    },
    getBrandsDecryptedDataFromStoreName: async(StoreName) => {
       const data = await Brands.find({
        select: 'encrypted_details',
        where: {
            storeName: StoreName,
        },
        limit: 1,
    });
    const encrypted_dets = data[0].encrypted_details;
    const decryptedData = EncryptionService.decryptData(encrypted_dets)
    return decryptedData
  },

    getTrackingDetail: async(BASE_URL, orderId, fulfillmentId) => {
        // console.log("======================================================= getTrackingDetail");

       /* const url = BASE_URL + `orders/${orderId}/fulfillments/${fulfillmentId}.json`;
         console.log("url > ", url);
        return await axios.get(url);*/
	const url = BASE_URL + `orders/${orderId}.json`;
        let res = await axios.get(url);
        let response = {}
        const found = res.data.order.fulfillments.find(element=> element.id == fulfillmentId);
        response = {fulfillment: found}
        res.data = response

        console.log("url > ", url);
        return res;
    },

    getOrderByNumber: async(BASE_URL, orderNumber) => {
        const url = BASE_URL + `orders.json?name=${orderNumber}&status=any&limit=1`;
        return await axios.get(url);
    },

    getTrackingDetailmanually: async(orderId, fulfillmentId, id) => {
    // console.log("======================================================getTrackingDetailmanually",fulfillmentId);

      return new Promise(async (resolve) => {
        try {
          let obj = {orderId, fulfillmentId, id}
          let base_url = `https://32c354b632796f5556f75f8a36f4b0a7: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@volley-stage.myshopify.com/admin/api/2020-07/`;

	  const url = base_url + `orders/${orderId}.json`;
          console.log("url > ", url);
        
          let res = await axios.get(url);
          let response = {}
          const found = res.data.order.fulfillments.find(element=> element.id == fulfillmentId);
          response = {fulfillment: found}
          res.data = response
          return resolve({status: true, data: res, origional: obj});

          /*const url = base_url + `orders/${orderId}/fulfillments/${fulfillmentId}.json`;
          console.log("url > ", url);
          axios.get(url).then((res) => {
            return resolve({status: true, data: res, origional: obj});
          }).catch((e) => {
            return resolve({status: false})
          });*/
        } catch (error) {
          return resolve({status: false});
        }

      })

    },

};
