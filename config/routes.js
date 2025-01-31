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

  '/': { view: 'pages/homepage' },

  /* ======================== Shopify Controller ===================================================== */

  '/locations': { controller: 'ShopifyController', action: 'getLocations' },
  '/orders': { controller: 'ShopifyController', action: 'orders' },
  '/order/:orderId': { controller: 'ShopifyController', action: 'orderDetail' },
  'GET /products': { controller: 'ShopifyController', action: 'getProductList' },
  'GET /states': { controller: 'ShopifyController', action: 'getStatesList' },
  'POST /add-tracking': { controller: 'FulfillmentController', action: 'addTracking' },
  'GET /tracking-info/:fulfillmentId': { controller: 'FulfillmentController', action: 'getTrackingStatus' },
  'GET /fulfillments': { controller: 'FulfillmentController', action: 'getFulfillments' },
  'POST /order/sendTrackingLink': { controller: 'FulfillmentController', action: 'sendTrackingEmail' },
  'GET /fulfillment/trackingdetail': { controller: 'FulfillmentController', action: 'fetchTrackingDetail' },

  /* ======================== Webhook Controller ===================================================== */
  'POST /webhook/order': { controller: 'WebhookController', action: 'orderWebhook2' },
  'GET /sync-fulfillment': { controller: 'WebhookController', action: 'syncFulfillment' },
  'POST /webhook/update-fulfillment-tracking-status': { controller: 'WebhookController', action: 'updateShopifyTrackingdetails' },
  'POST /webhookAPI/update-status-manually': { controller: 'WebhookController', action: 'updateTrackingStatusManually' },
  'GET /webhookAPI/update-pending-status-to-success': { controller: 'WebhookController', action: 'updateStatusOfFulFillmentToSucccess' },

  /* ======================== Stripe Controller ===================================================== */

  'POST /stripe/create-account': { controller: 'StripeController', action: 'createAccount' },
  'POST /stripe/send-account-link': { controller: 'StripeController', action: 'createAccountLink' },
  'GET /stripe/refresh-link/:accountId': { controller: 'StripeController', action: 'refreshLink' },

  /* ======================== Super admin Controller ===================================================== */
  //Super Admin password update
  'POST /public/super/admin/update': { controller: 'SuperAdminController', action: 'updatePassword' },


  /* ======================== Admin Session Controller ===================================================== */
  //Admin Login
  'POST /public/admin/login': { controller: 'AdminSessionController', action: 'adminLogin' },
  //Admin access token login
  'POST /admin/accessTokenLogin': { controller: 'AdminSessionController', action: 'adminAccessTokenLogin' },
  //Admin logout
  'POST /admin/logout': { controller: 'AdminSessionController', action: 'logoutAdmin' },

  /* ======================== Staff Controller ===================================================== */
  //Add Staff
  'POST /staff/add': { controller: 'StaffManagementController', action: 'addStaff' },
  //Edit Staff
  'PUT /staff/edit': { controller: 'StaffManagementController', action: 'editStaff' },
  //Delete Staff
  'DELETE /staff/delete': { controller: 'StaffManagementController', action: 'deleteStaff' },
  //Reset Password Staff
  'PUT /staff/resetPassword': { controller: 'StaffManagementController', action: 'resetStaffPassword' },
  //List Staff
  'POST /staff/list': { controller: 'StaffManagementController', action: 'staffList' },

  /* ======================== Rule Controller ===================================================== */

  'POST /rule/state-rule': { controller: 'RuleController', action: 'createStateRule' },
  'PUT /rule/state-rule/update': { controller: 'RuleController', action: 'editStateRule' },
  'DELETE /rule/state-rule/remove': { controller: 'RuleController', action: 'deleteStateRule' },

  'POST /rule/zip-rule': { controller: 'RuleController', action: 'createZipRule' },

  'POST /rule/product-rule': { controller: 'RuleController', action: 'createProductRule' },
  'PUT /rule/product-rule/update': { controller: 'RuleController', action: 'editProductRule' },
  'DELETE /rule/product-rule/remove': { controller: 'RuleController', action: 'deleteProductRule' },

  'GET /rule/get-rules': { controller: 'RuleController', action: 'getRuleList' },
  'GET /rule/product-rules': { controller: 'RuleController', action: 'getProductRuleList' },
  'GET /rule/state-rules': { controller: 'RuleController', action: 'getStateRuleList' },

  'GET /rule/available-states': { controller: 'RuleController', action: 'getAvailableStates' },
  'GET /rule/available-products': { controller: 'RuleController', action: 'getAvailableProducts' },


  /* ======================== Account Controller ===================================================== */
  //Link account to location id
  'PUT /account/link': { controller: 'AccountController', action: 'linkLocationIdToAccount' },
  //UnLink account to location id
  'PUT /account/unlink': { controller: 'AccountController', action: 'unlinkLocationIdToAccount' },
  //Activate Account
  'PUT /account/activate': { controller: 'AccountController', action: 'activateAccount' },
  //Account list
  'GET /account/list': { controller: 'AccountController', action: 'accountList' },
  'POST /account/delete': { controller: 'AccountController', action: 'deleteAccount' },
  // To Change In-House Business flag
  'PUT /account/change-in-house-business': { controller: 'AccountController', action: 'changeInHouseBusiness' },
  // To Update Business(Retailer) details
  'PUT /account/edit': { controller: 'AccountController', action: 'updateAccount' },
  // To add requested retailer
  'POST /request-cms-retailer': { controller: 'AccountController', action: 'addRequestedCMSRetailer' },
  // To get all requested retailer
  'GET /get-cms-retailers': { controller: 'AccountController', action: 'getRequestedCMSRetailers' },
  // To Update Requested Retailer
  'POST /update-retailer-request': { controller: 'AccountController', action: 'editRequestRetailer' },
  //DElete Retailer Request
  'DELETE /delete-retailer-request': { controller: 'AccountController', action: 'deleteRequestRetailer' },


  //Get All States
  'GET /states/all': { controller: 'AccountController', action: 'allStates' },


  //Super Admin Only
  'POST /toggle-retailer-status': { controller: 'AccountController', action: 'toggleRetailerRequest' },




  /* ======================== Payout Controller ===================================================== */

  'GET /payouts': { controller: 'PaymentController', action: 'getPayoutList' },
  'GET /balances': { controller: 'PaymentController', action: 'getBalances' },

  /* ======================== Brand Controller ===================================================== */

  // Brand Registration (Create)
  'POST /public/brand/register': { controller: 'BrandController', action: 'registerBrand' },

  // Update Brand Password
  'POST /public/brand/update-password': { controller: 'BrandController', action: 'updatePassword' },

  // Update Brand Details
  'POST /public/brand/update-details': { controller: 'BrandController', action: 'updateDetails' },

  // Get All Brands
  'GET /public/brand/all': { controller: 'BrandController', action: 'getAllBrands' },

  // Get specific brand
  'GET /public/brand': { controller: 'BrandController', action: 'getSpecificBrands' },

  // Save Shopify details to db after encrypting
  'POST /public/brand/save-shopify-info': { controller: 'BrandController', action: 'encryptData' },

  // fetch Shopify details to db after encrypting
  'POST /public/brand/fetch-shopify-data': { controller: 'BrandController', action: 'decryptData' },

  //Update Brand Commission
  'POST /public/brand/handle-commission': { controller: 'BrandController', action: 'updateCommission' },



  /* ======================== Rating Controller ===================================================== */


  'POST /public/brand/rate-retailer': { controller: 'RatingController', action: 'rateAccount' },

  /* ======================== KPI Controller ===================================================== */

  'GET /public/kpi/orders':{ controller: 'KpiController', action : 'getOrderFullfillmentsKPI'},
  'GET /public/kpi/brand-orders':{ controller: 'KpiController', action : 'getBrandFulfillmentsKPI'},


  /* ======================== URLs Controller ===================================================== */

  // Create a new URL
  'POST /public/urls': { controller: 'UrlsController', action: 'create' },

  // Get all URLs
  'GET /public/urls': { controller: 'UrlsController', action: 'find' },

  // Get a specific URL by ID
  'GET /public/urls/:id': { controller: 'UrlsController', action: 'findOne' },

  // Update a specific URL by ID
  'PUT /public/urls/:id': { controller: 'UrlsController', action: 'update' },
  // 'PATCH /public/urls/:id': { controller: 'UrlsController', action: 'update' },

  // Delete a specific URL by ID
  'DELETE /public/urls/:id': { controller: 'UrlsController', action: 'delete' },

  /* ======================== Auth Controller ===================================================== */

  // Brand Login
  'POST /public/auth/login': { controller: 'AuthController', action: 'login' },

  // Brand Logout
  'POST /public/auth/logout': { controller: 'AuthController', action: 'logout' },
};
