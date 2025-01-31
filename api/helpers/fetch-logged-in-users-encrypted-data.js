module.exports = {

    friendlyName: 'Fetch logged in user\'s encrypted data',

    description: 'Fetches the currently logged-in user\'s encrypted_details from the Brands table.',

    inputs: {
      req: {
        type: 'ref',
        required: true,
        description: 'The incoming request object containing session data.'
      }
    },

    exits: {
      notFound: {
        description: 'No encrypted details found for this user.'
      }
    },

    fn: async function (inputs, exits) {
      try {
        const userId = inputs.req.sessionData.brand.id;
        const brand = await Brands.findOne({ id: userId });
        // console.log(" userId =====================>",userId);
        // console.log(" brand =====================>",brand);
        if (!brand || !brand.encrypted_details) {
          return exits.notFound({
            message: 'No encrypted details found for this user.'
          });
        }

        return exits.success(brand.encrypted_details);
      } catch (error) {
        sails.log.error('Error fetching encrypted details:', error);
        throw error;
      }
    }
  };
