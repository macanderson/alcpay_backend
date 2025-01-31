const ShopifyService = require('../services/ShopifyService');
const ResponseService = require('../services/ResponseService');
const EncryptionService = require('../services/EncryptionService');
const url = require('url');
const { resolve } = require('path');
const { rejects } = require('assert');
const { calculateRatings } = require('../services/RatingUtil');

module.exports = {

    /**
     * Get Shopify Locations
     * API Endpoint :   /locations
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and locations list or relevant error code with message.
     */
    getLocations: async function(req, res) {
        try {
            sails.log.info("====================== GET SHOPIFY LOCATIONS REQUEST ==============================\n");
            // Fetch and decrypt user data
            const encrypted_details = await sails.helpers.fetchLoggedInUsersEncryptedData.with({ req });
            // console.log(" encrypted_details =====================>",encrypted_details);
            const decryptedData = EncryptionService.decryptData(encrypted_details);
            // console.log(" decryptedData =====================>",decryptedData);
            const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
            // console.log(" BASE_URL =====================>",BASE_URL);
            
            const locationData = await ShopifyService.fetchLocations(BASE_URL);
            
            let locations = locationData.data.locations;
            for (let loc of locations) {
                const acctInfo = await Account.find({ locationId: loc.id });
                
                if (acctInfo.length > 0) {
                    loc.retailerId = acctInfo[0].id;
                    loc.retailer = acctInfo[0].businessName;
                    const ratings = await AccountRating.find({
                        where: { accountId: loc.retailerId }
                      });
                      const { avgPriceRating, avgSpeedRating, avgCommRating, overallAvgRating } = calculateRatings(ratings);
                      loc.avgPriceRating = avgPriceRating;
                      loc.avgSpeedRating = avgSpeedRating;
                      loc.avgCommRating = avgCommRating;
                      loc.overallAvgRating = overallAvgRating;
                }
            }
            return res.ok(locations);
        } catch (e) {
            return ResponseService.error(res, e, 'Error fetching location');
        }
    },

    /**
     * Get Orders List
     * API Endpoint :   /orders
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request with pagination and filtering params.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and orders list or relevant error code with message.
     */
    orders: async(req, res) => {
        try {
            sails.log.info("====================== GET ORDERS LIST REQUEST ==============================\n");
            sails.log.info("REQ PARAMS : ", req.allParams());
            const params = req.allParams();
            // Fetch and decrypt user data
            const encrypted_details = await sails.helpers.fetchLoggedInUsersEncryptedData.with({ req });
            // console.log(" encrypted_details =====================>",encrypted_details);
            const decryptedData = EncryptionService.decryptData(encrypted_details);
            // console.log(" decryptedData =====================>",decryptedData);
            const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
            // console.log(" BASE_URL =====================>",BASE_URL);
            if (params && params.searchOrderNumber && params.searchOrderNumber != '') {
                let getOrder = await getOrderByOrderNumber(BASE_URL, params.searchOrderNumber, '');
                if (!getOrder.status) {
                    return res.ok({ orders: [], nav: {} });
                }
                return res.ok({ orders: getOrder.data, nav: {} });
            }
            
            
            const orders = await ShopifyService.getAllOrders(BASE_URL, params.pageInfo ? params.pageInfo : '', 10);
            // console.log(" orders =====================>",orders);

            let links = orders.headers.link ? orders.headers.link.split(',') : [];
            let nav = {};
            for (const link of links) {
                const dir = link.split(';');
                const navLink = url.parse((dir[0].substring(1, dir[0].length - 1)), true);
                const query = navLink.query;
                if (dir[1].includes('next')) {
                    nav['next'] = true;
                    nav['nextInfo'] = query['page_info'];
                }
                if (dir[1].includes('prev')) {
                    nav['prev'] = true;
                    nav['prevInfo'] = query['page_info'];
                }
            }

            return res.ok({ orders: orders.data.orders, nav });
        } catch (e) {
            return ResponseService.error(res, e, 'Error getting  order list');
        }
    },

    /**
     * Get Order Detail
     * API Endpoint :   /order/:orderId
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request containing orderId param.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and order details or relevant error code with message.
     */
    orderDetail: async(req, res) => {
        try {
            sails.log.info("====================== GET ORDER DETAIL REQUEST ==============================\n");
            sails.log.info("REQ PARAMS : ", req.params);
            // Fetch and decrypt user data
            const encrypted_details = await sails.helpers.fetchLoggedInUsersEncryptedData.with({ req });
            // console.log(" encrypted_details =====================>",encrypted_details);
            const decryptedData = EncryptionService.decryptData(encrypted_details);
            // console.log(" decryptedData =====================>",decryptedData);
            const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
            // console.log(" BASE_URL =====================>",BASE_URL);

            const params = req.allParams();
            const orderDetail = await ShopifyService.getOrderDetails(BASE_URL, params.orderId);
            return res.ok(orderDetail.data);
        } catch (e) {
            return ResponseService.error(res, e, 'Error getting order details');
        }
    },

    /**
     * Get Product List
     * API Endpoint :   /products
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and products list or relevant error code with message.
     */
    getProductList: async(req, res) => {
        try {
            sails.log.info("====================== GET PRODUCT LIST REQUEST ==============================\n");
            sails.log.info("REQ QUERY : ", req.query);
            const encrypted_details = await sails.helpers.fetchLoggedInUsersEncryptedData.with({ req });
            // console.log(" encrypted_details =====================>",encrypted_details);
            const decryptedData = EncryptionService.decryptData(encrypted_details);
            // console.log(" decryptedData =====================>",decryptedData);
            const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
            const products = await ShopifyService.getProductList(BASE_URL);
            return res.ok(products.data);
        } catch (e) {
            return ResponseService.error(res, e, 'Error getting product list');
        }
    },

    /**
     * Get States List
     * API Endpoint :   /states
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and states list or relevant error code with message.
     */
    getStatesList: async(req, res) => {
        try {
            sails.log.info("====================== GET STATES LIST REQUEST ==============================\n");
            const states = await States.find({});
            return res.ok(states);
        } catch (e) {
            return ResponseService.error(res, e, 'Error getting states list');
        }
    }

};

function getOrderByOrderNumber(BASE_URL, searchOrder, pageInfo) {
    return new Promise(async(resolve) => {

        var orders = await ShopifyService.getOrderByNumber(BASE_URL, searchOrder);
        console.log(orders);
        if (orders && orders.status && orders.data && orders.data.orders && orders.data.orders.length > 0) {
            return resolve({ status: true, data: orders.data.orders });
        }

        return resolve({ status: false, message: "order number not found" });

        // var orders = await ShopifyService.getAllOrders(pageInfo, 100);
        // if (orders && orders.status && orders.data && orders.data.orders && orders.data.orders.length > 0) {
        //     searchOrderArr = orders.data.orders.filter((element) => {
        //         if (element.order_number == parseInt(searchOrder)) {
        //             return element
        //         }
        //     })

        //     if (searchOrderArr.length == 0) {
        //         const links = orders.headers.link ? orders.headers.link.split(',') : [];
        //         let nav_nextInfo = null;
        //         for (const link of links) {
        //             const dir = link.split(';');
        //             const navLink = url.parse((dir[0].substring(1, dir[0].length - 1)), true);
        //             const query = navLink.query;
        //             if (dir[1].includes('next')) {
        //                 nav_nextInfo = query['page_info'];
        //             }
        //         }
        //         if (!nav_nextInfo) {
        //             return resolve({ status: false, message: "order number not found" });
        //         }
        //         let search = searchOrder
        //         await getOrderByOrderNumber(search, nav_nextInfo);
        //     }
        //     return resolve({ status: true, data: searchOrderArr });
        // }
        // return resolve({ status: false, message: "order number not found" });
    })
}
