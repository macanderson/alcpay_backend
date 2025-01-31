const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ResponseService = require('../services/ResponseService');
const Joi = require('joi');
const to = require('await-to-js').default;

module.exports = {
  /**
   * Create Stripe Account Link
   * API Endpoint :   /stripe/account-link
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing accountId.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and account link info or relevant error code with message.
   */
  createAccountLink: async (req, res) => {
    try {
      sails.log.info("====================== CREATE STRIPE ACCOUNT LINK REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;
      const accountId = data.accountId;
      const account = await Account.find({ accountId: accountId });

      var stripeData = {
        account: accountId,
        refresh_url: `${process.env.STRIPE_REFRESH_HOST}/stripe/refresh-link/${account.id}`,
        return_url: `${process.env.WEB_HOST}/stripe-success/${account.id}`,
        type: 'account_onboarding',
      };
      const accountLinkInfo = await stripe.accountLinks.create(stripeData);

      let content = await sails.renderView('email/verification', {
        businessName: account[0].businessName,
        stripeLink: accountLinkInfo.url,
        layout: false
      });
      MailService.sendEmailToAccount(account[0].email, 'Account Onboarding', content, true);

      return res.ok(accountLinkInfo);
    } catch (e) {
      ResponseService.error(res, e, 'Error validating account');
    }

  },

  /**
   * Create Stripe Account
   * API Endpoint :   /stripe/account
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing business details.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and created account or relevant error code with message.
   */
  createAccount: async (req, res) => {
    try {
      sails.log.info("====================== CREATE STRIPE ACCOUNT REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const data = req.body;
      // const schema = Joi.obect({});
      sails.log.debug(data);
      const inHouseBusiness = eval(data['inHouseBusiness']);
      const account = await stripe.account.create(
        {
          country: 'US',
          type: 'express',
          requested_capabilities: ['card_payments', 'transfers']
        }
      );
      sails.log.debug('Account created', account);
      await Account.create({
        businessName: data.businessName,
        email: data.email,
        contact: data.contact,
        website: data.website,
        accountId: account.id,
        inHouseBusiness: inHouseBusiness
      });

      const accountLinkInfo = await stripe.accountLinks.create(
        {
          account: account.id,
          // eslint-disable-next-line camelcase
          refresh_url: `${process.env.STRIPE_REFRESH_HOST}/stripe/refresh-link/${account.id}`,
          // eslint-disable-next-line camelcase
          return_url: `${process.env.WEB_HOST}/stripe-success/${account.id}`,
          type: 'account_onboarding',
        }
      );

      sails.log.debug('Link Info', accountLinkInfo);
      // TODO: send link to user
      let content = await sails.renderView('email/verification', {
        businessName: data.businessName,
        stripeLink: accountLinkInfo.url,
        layout: false
      });
      MailService.sendEmailToAccount(data.email, 'Account Onboarding',
        content, true);
      return res.ok(account);
    } catch (e) {
      ResponseService.error(res, e, e.message);
    }
  },

  /**
   * Refresh Stripe Account Link
   * API Endpoint :   /stripe/refresh-link/:id
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing account ID.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and refreshed link or relevant error code with message.
   */
  refreshLink: async (req, res) => {
    try {
      sails.log.info("====================== REFRESH STRIPE ACCOUNT LINK REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.params);
      const params = req.allParams();
      const accountId = params['accountId'];
      const accountLinkInfo = await stripe.accountLinks.create(
        {
          account: accountId,
          refresh_url: `${process.env.STRIPE_REFRESH_HOST}/stripe/refresh-link/${accountId}`,
          // eslint-disable-next-line camelcase
          return_url: `${process.env.WEB_HOST}/stripe-success/${accountId}`,
          type: 'account_onboarding',
        }
      );
      return res.redirect(accountLinkInfo.url);
    } catch (e) {
      ResponseService.error(res, e, e.message);
    }
  },

  /**
   * Get Stripe Account Link
   * API Endpoint :   /stripe/get-account-link/:id
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing account ID.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and account link or relevant error code with message.
   */
  getAccountLink: async (req, res) => {
    try {
      sails.log.info("====================== GET STRIPE ACCOUNT LINK REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.params);

    const data = req.body;

    var accountId = data.accountId;
    const account = await Account.find({ accountId: accountId });
    sails.log.debug('account', account);

    var stripeData = {
      account: accountId,
      refresh_url: `https://volleyapi.konnectshift.com/stripe/refresh-link/${accountId}`,
      return_url: `https://volleyapi.konnectshift.com/stripe-success/${accountId}`,
      type: 'account_onboarding',
    };
    sails.log.debug('data', stripeData);
    const accountLinkInfo = await stripe.accountLinks.create(stripeData);
    sails.log.debug('Link Info', accountLinkInfo);

    let content = await sails.renderView('email/verification', {
      businessName: account.businessName,
      stripeLink: accountLinkInfo.url,
      layout: false
    });
    sails.log.debug('content', content);

    return res.ok(accountLinkInfo);
    } catch (e) {
      ResponseService.error(res, e, e.message);
    }
  }

};
