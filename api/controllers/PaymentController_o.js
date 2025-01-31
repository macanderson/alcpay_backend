
const nodemailer = require('nodemailer');
const Moment = require('moment');
const sendgridId = sails.config.custom.sendgridId;
const sendgridUser = sails.config.custom.sendgridUser;
const sendgridSMTP = sails.config.custom.sendgridSMTP;
const sendgridPort = sails.config.custom.sendgridPort | 0;

module.exports = {
  getPayoutList: async (req, res) => {
    try {
      const params = req.allParams();
      const pageSize = params['pageSize'];
      const page = params['page'];
      const sortBy = params['sort'];
      const status = params['status'];
      const totalCount = await Payout.count();
      let payoutList = [];
      if (sortBy) {
        const sortParam = sortBy.split(' ')[0];
        const sortOrder = sortBy.split(' ')[1];
        let sortObject = {};
        sortObject[sortParam] = sortOrder;
        payoutList = await Payout.find({
          where: {status: status ? status : undefined},
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort([sortObject]);
      }
      else {
        payoutList = await Payout.find({
          where: {status: status ? status : undefined},
          limit: pageSize,
          skip: (page - 1) * pageSize
        }).sort('createdAt DESC');
      }
      return res.ok({total: totalCount, records: payoutList, page: page, pageSize: pageSize});
    } catch (e) {
      return ResponseService.error(res, e, 'error getting data');
    }
  },

  getBalances: async (req, res) => {
    try {
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

  checkMail: async (req, res) => {
    try {
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

      sails.log.info("Message sent: ", info.messageId);

      return res.ok({ success: true });

    } catch (exception) {
      sails.log.error("EMAIL ERROR : " + exception);
    }
  },
};

