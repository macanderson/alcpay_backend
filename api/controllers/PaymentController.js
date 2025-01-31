const nodemailer = require('nodemailer');
const Moment = require('moment');
const sendgridId = sails.config.custom.sendgridId;
const sendgridUser = sails.config.custom.sendgridUser;
const sendgridSMTP = sails.config.custom.sendgridSMTP;
const sendgridPort = sails.config.custom.sendgridPort | 0;

module.exports = {
  /**
   * Get Payout List
   * API Endpoint :   /payment/payout/list
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing pagination, sorting and filtering params.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and payout list or relevant error code with message.
   */
  getPayoutList: async (req, res) => {
    try {
      sails.log.info("====================== GET PAYOUT LIST REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.allParams());
      const params = req.allParams();
      const pageSize = params['pageSize'];
      const page = params['page'];
      const sortBy = params['sort'];
      const status = params['status'];
      const retailer = params['retailer'];
      const orderNumber = params['orderNumber']; 
      const createdDate = params['createdDate']; 
      
      const totalCount = await Payout.count();
  
      let filters = {};
      
      if (status) {
        filters.status = status;
      }
      if (retailer) {
        filters.retailerName = retailer;
      }
      if (orderNumber) {
        filters.orderNumber = orderNumber;
      }
      if (createdDate) {
        const timestamp = parseInt(createdDate, 10);
        const date = new Date(timestamp); 
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime(); 
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime(); 
        filters.createdAt = { '>=': startOfDay, '<=': endOfDay };
      }
  
      let payoutList = [];
  
      if (sortBy) {
        const sortParam = sortBy.split(' ')[0];
        const sortOrder = sortBy.split(' ')[1];
        let sortObject = {};
        sortObject[sortParam] = sortOrder;
        payoutList = await Payout.find({
          where: filters,
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort([sortObject]);
      } else {
        payoutList = await Payout.find({
          where: filters,
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort('createdAt DESC');
      }
  
      return res.ok({ total: totalCount, records: payoutList, page: page, pageSize: pageSize });
    } catch (e) {
      return ResponseService.error(res, e, 'Error getting data');
    }
  },

  /**
   * Get Account Balances
   * API Endpoint :   /payment/balances
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and balance information or relevant error code with message.
   */
  getBalances: async (req, res) => {
    try {
      sails.log.info("====================== GET BALANCES REQUEST ==============================\n");
      sails.log.info("REQ PARAMS : ", req.allParams());
      const params = req.allParams();
      const pageSize = params['pageSize'];
      const page = params['page'];
      const sortBy = params['sort'];
      const totalCount = await Balance.count();
      let payoutList = [];
      if (sortBy) {
        const sortParam = sortBy.split(' ')[0];
        const sortOrder = sortBy.split(' ')[1];
        let sortObject = {};
        sortObject[sortParam] = sortOrder;
        payoutList = await Balance.find({
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort([sortObject]);
      }
      else {
        payoutList = await Balance.find({
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort('updatedAt DESC');
      }
      return res.ok({total: totalCount, records: payoutList, page: page, pageSize: pageSize});
    } catch (e) {
      return ResponseService.error(res, e, 'error getting data');
    }
  },

  /**
   * Check Mail Status
   * API Endpoint :   /payment/check-mail
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and mail status or relevant error code with message.
   */
  checkMail: async (req, res) => {
    try {
      sails.log.info("====================== CHECK MAIL REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);
      const transporter = nodemailer.createTransport({
        host: sendgridSMTP,
        port: sendgridPort,
        secure: true, // true for 465, false for other ports
        auth: {
          user: sendgridUser,
          pass: sendgridId,
        },
      });

      let mailOptions = {
        from: "Volley <orders@wholesomespirits.com>",
        to: req.body.sendMail,
        subject: "Sendmail",
        replyTo: "orders@wholesomespirits.com",
      };

        mailOptions.text = "content";

      const info = await transporter.sendMail(mailOptions);

      console.log("Message sent");
      
      sails.log.info("Message sent: ", info.messageId);

      return res.ok({ success: true });

    } catch (exception) {
      sails.log.error("EMAIL ERROR : " + exception);
    }
  },
};
