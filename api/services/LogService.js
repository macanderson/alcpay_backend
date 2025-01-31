module.exports = {

    /**
     * Log and send error email
     *
     * @param exception - Error/exception object received
     */

    error: (exception) => {

        sails.log.error(exception);

        try {
            if (_.isObject(exception)) {
                // exception = JSON.stringify(exception);
                exception = _(exception).toString() + '\n Details : \n' + JSON.stringify(exception);
            }
            // MailService.sendEmailToAccount('sandeep@konnectshift.com', 'Server Issue', exception);

        } catch (e) {
        }
    },

};
