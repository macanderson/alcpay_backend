/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': {view: 'pages/homepage'},

  /* ======================== Shopify Controller ===================================================== */

    '/locations': {controller: 'ShopifyController', action: 'getLocations'},
    '/orders': {controller: 'ShopifyController', action: 'orders'},
    '/order/:orderId': {controller: 'ShopifyController', action: 'orderDetail'},
    'GET /products': {controller: 'ShopifyController', action: 'getProductList'},
    'GET /states': {controller: 'ShopifyController',  action: 'getStatesList'},
    'POST /add-tracking': {controller: 'FulfillmentController', action: 'addTracking'},
    'GET /tracking-info/:fulfillmentId': {controller: 'FulfillmentController', action: 'getTrackingStatus'},
    'GET /fulfillments': {controller: 'FulfillmentController', action: 'getFulfillments'},
    'POST /order/sendTrackingLink': {controller: 'FulfillmentController', action: 'sendTrackingEmail'},
    'GET /fulfillment/trackingdetail': {controller: 'FulfillmentController', action: 'fetchTrackingDetail'},

  /* ======================== Webhook Controller ===================================================== */
    'POST /webhook/order': {controller: 'WebhookController', action: 'orderWebhook2'},
    'GET /sync-fulfillment': {controller: 'WebhookController', action: 'syncFulfillment'},
    'POST /webhook/update-fulfillment-tracking-status': {controller: 'WebhookController', action: 'updateShopifyTrackingdetails'},
    'POST /webhookAPI/update-status-manually': {controller: 'WebhookController', action: 'updateTrackingStatusManually'},
    'GET /webhookAPI/update-pending-status-to-success': {controller: 'WebhookController', action: 'updateStatusOfFulFillmentToSucccess'},

  /* ======================== Stripe Controller ===================================================== */

    'POST /stripe/create-account': {controller: 'StripeController', action: 'createAccount'},
    'POST /stripe/send-account-link': {controller: 'StripeController', action: 'createAccountLink'},
    'GET /stripe/refresh-link/:accountId': {controller: 'StripeController', action: 'refreshLink'},

    /* ======================== Super admin Controller ===================================================== */
    //Super Admin Login
    'POST /public/super/admin/login': {controller: 'SuperAdminController', action: 'adminLogin'},
    //Super Admin password update
    'POST /public/super/admin/update': {controller: 'SuperAdminController', action: 'updatePassword'},
    //Super Admin Logout
    'POST /public/super/admin/logout': {controller: 'SuperAdminController', action: 'logoutAdmin'},


    /* ======================== Admin Session Controller ===================================================== */
    //Admin Login
    'POST /public/admin/login': {controller: 'AdminSessionController', action: 'adminLogin'},
    //Admin access token login
    'POST /admin/accessTokenLogin': {controller: 'AdminSessionController', action: 'adminAccessTokenLogin'},
    //Admin logout
    'POST /admin/logout': {controller: 'AdminSessionController', action: 'logoutAdmin'},

    /* ======================== Staff Controller ===================================================== */
    //Add Staff
    'POST /staff/add': {controller: 'StaffManagementController', action: 'addStaff'},
    //Edit Staff
    'PUT /staff/edit': {controller: 'StaffManagementController', action: 'editStaff'},
    //Delete Staff
    'DELETE /staff/delete': {controller: 'StaffManagementController', action: 'deleteStaff'},
    //Reset Password Staff
    'PUT /staff/resetPassword': {controller: 'StaffManagementController', action: 'resetStaffPassword'},
    //List Staff
    'POST /staff/list': {controller: 'StaffManagementController', action: 'staffList'},

  /* ======================== Rule Controller ===================================================== */

  'POST /rule/state-rule': {controller: 'RuleController', action: 'createStateRule'},
  'PUT /rule/state-rule/update': {controller: 'RuleController', action: 'editStateRule'},
  'DELETE /rule/state-rule/remove': {controller: 'RuleController', action: 'deleteStateRule'},

  'POST /rule/zip-rule': {controller: 'RuleController', action: 'createZipRule'},

  'POST /rule/product-rule': {controller: 'RuleController', action : 'createProductRule'},
  'PUT /rule/product-rule/update': {controller: 'RuleController', action : 'editProductRule'},
  'DELETE /rule/product-rule/remove': {controller: 'RuleController', action : 'deleteProductRule'},

  'GET /rule/get-rules': {controller: 'RuleController',  action: 'getRuleList'},
  'GET /rule/product-rules': {controller: 'RuleController',  action: 'getProductRuleList'},
  'GET /rule/state-rules': {controller: 'RuleController',  action: 'getStateRuleList'},


    /* ======================== Account Controller ===================================================== */
    //Link account to location id
    'PUT /account/link': {controller: 'AccountController', action: 'linkLocationIdToAccount'},
    //UnLink account to location id
    'PUT /account/unlink': {controller: 'AccountController', action: 'unlinkLocationIdToAccount'},
    //Activate Account
    'PUT /account/activate': {controller: 'AccountController', action: 'activateAccount'},
    //Account list
    'GET /account/list': {controller: 'AccountController', action: 'accountList'},
    'POST /account/delete': {controller: 'AccountController', action: 'deleteAccount'},
    // To Change In-House Business flag
    'PUT /account/change-in-house-business': { controller: 'AccountController', action: 'changeInHouseBusiness' },
    // To Update Business(Retailer) details
    'PUT /account/update': { controller: 'AccountController', action: 'updateAccount' },

  /* ======================== Payout Controller ===================================================== */

  'GET /payouts': {controller: 'PaymentController', action: 'getPayoutList'},
  'GET /balances': {controller: 'PaymentController', action: 'getBalances'},


  // /* ======================== Brand Controller ===================================================== */

  // // Brand Registration (Create)
  // 'POST /public/brand/register': { controller: 'BrandController', action: 'registerBrand' },

  // // Brand Login
  // 'POST /public/brand/login': { controller: 'BrandController', action: 'loginBrand' },

  // // Update Brand Password
  // 'POST /public/brand/update-password': { controller: 'BrandController', action: 'updatePassword' },

  // // Brand Logout
  // 'POST /public/brand/logout': { controller: 'BrandController', action: 'logoutBrand' },

  // ============================== send hello mail to check stripe =================================

  'POST /check_mail': {controller: 'PaymentController', action: 'checkMail'},


};
