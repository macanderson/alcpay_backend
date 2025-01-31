/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {

  /***************************************************************************
  *                                                                          *
  * Any other custom config this Sails app should use during development.    *
  *                                                                          *
  ***************************************************************************/
  // sendgridSecret: 'SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',
  // …

  // STORE_URL: process.env.STORE_URL,
  // STORE_ACCESS_ID: process.env.STORE_ACCESS_ID,
  // STORE_PASSWORD: process.env.STORE_PASSWORD,
  // API_VERSION: process.env.API_VERSION,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD:process.env.REDIS_PASSWORD,
    sendgridUser: process.env.SENDGRID_USER,
    sendgridSMTP: process.env.SENDGRID_SMTP,
    sendgridPort: process.env.SENDGRID_PORT,
    sendgridId: process.env.SENDGRID_ID,
    
  // Parsing the keys from environment variables
  STORE_ENCRYPTION_PRIVATE_KEY: process.env.STORE_ENCRYPTION_PRIVATE_KEY.replace(/\\n/g, '\n'),
  STORE_ENCRYPTION_PUBLIC_KEY: process.env.STORE_ENCRYPTION_PUBLIC_KEY.replace(/\\n/g, '\n'),

};
