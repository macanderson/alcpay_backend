
/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions, unless overridden.       *
     * (`true` allows public access)                                            *
     *                                                                          *
     ***************************************************************************/

    '*': ['IsAuthorized'],

    /* ======================= Super Admin Controller ================================================= */

    'SuperAdminController': {
        'adminLogin': true,
        'updatePassword': true,
    },

    'WebhookController': {
        'orderWebhook': true,
	'orderwebhook':true,
        'orderWebhook2': true,
        "syncFulfillment": true,
        "updateShopifyTrackingdetails":true,
        "updateTrackingStatusManually":true,
        "updateStatusOfFulFillmentToSucccess":true
    },

    'FulfillmentController': {
      'addTracking': true,
      'getTrackingStatus': true,
    },


    /* ======================= Admin session controller ================================================= */

    'AdminSessionController': {
        '*': ['IsAuthorized'],
        'adminLogin': true
    },

    /* ======================= Staff Controller ================================================= */

    'StaffManagementController': {
        '*': ['IsAuthorized'],
    },

    /* ======================= Account Controller ================================================= */

    'AccountController': {
        'activateAccount': true,
    },

    'BrandController': {
        'registerBrand':true,
    },

    'AuthController': {
        'login':true,
    },

  /* Stripe controller */

    'StripeController': {
      'refreshLink': true,
    },

      /* ======================= Urls Controller ================================================= */
  'UrlsController': {
    '*': ['IsAuthorized'], // Apply IsAuthorized to all actions by default
    'create': ['IsAuthorized', 'isSuperAdmin'], // Only Super Admin can create
    'update': ['IsAuthorized', 'isSuperAdmin'], // Only Super Admin can update
    'delete': ['IsAuthorized', 'isSuperAdmin'], // Only Super Admin can delete
    'find': ['IsAuthorized'], // Any authorized user can view URLs
    'findOne': ['IsAuthorized'], // Any authorized user can view a specific URL
  },
};
