const nodemailer = require('nodemailer');
const Moment = require('moment');
const sendgridId = sails.config.custom.sendgridId;
const sendgridUser = sails.config.custom.sendgridUser;
const sendgridSMTP = sails.config.custom.sendgridSMTP;
const sendgridPort = sails.config.custom.sendgridPort | 0;

module.exports = {

    /**
     * Send email to account.
     *
     * @param emailTo - Email to
     * @param subject - Subject of email
     * @param content - Body of Email
     * @param isHtml - Is content html
     * @param attachmentFileName - Attachment file name
     * @param attachmentFileUrl - Url of attachment file
     * @returns {Promise<void>}
     */

    sendEmailToAccount: async (emailTo, subject, content, isHtml, attachmentFileName, attachmentFileUrl) => {
        console.log("sendEmailToAccount 29",emailTo);

        try {

            const transporter = nodemailer.createTransport({
                host: sendgridSMTP,
                port: sendgridPort,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: sendgridUser,
                    pass: sendgridId,
                }
            });

            let mailOptions = {
                from: "Volley <orders@wholesomespirits.com>",
                to: emailTo,
                subject: subject,
                replyTo: 'orders@wholesomespirits.com'
            };

            if (isHtml) {
                mailOptions.text = '';
                mailOptions.html = content;
            } else {
                mailOptions.text = content;
            }

            if (attachmentFileUrl) {
                mailOptions.attachments = [{
                    filename: attachmentFileName,
                    path: attachmentFileUrl
                }];
            }

            // send mail with defined transport object

            const info = await transporter.sendMail(mailOptions);
            console.log("sendEmailToAccount 61");


            sails.log.info("Message sent: ", info.messageId);
        } catch (exception) {
            sails.log.error("EMAIL ERROR : " + exception);
        }

    },

};
