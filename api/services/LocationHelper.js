module.exports = {

  /**
   * Fetches locations based on a given zip code.
   * @param {string} zipCode - The zip code to search within.
   * @returns {Array} - Array of matching location records.
   */
  fetchLocationByZip: async (zipCode) => {
    return await LocationMap.find({
      zipMin: { '<': zipCode },
      zipMax: { '>': zipCode }
    });
  },

  /**
   * Fetches locations that include a product with the specified variant ID.
   * @param {number|string} variantId - The variant ID to search for.
   * @returns {Array} - Array of matching location records.
   */
  fetchLocationByProductVariant: async (variantId) => {
    const allLocations = await ProductLocationMap.find({});
    return allLocations.filter(location => 
      location.products.some(product => product.variantId === variantId)
    );
  },

  /**
   * Fetches locations that include a product with the specified product ID.
   * @param {number|string} productId - The product ID to search for.
   * @returns {Array} - Array of matching location records.
   */
  fetchLocationByProductId: async (productId) => {
    const allLocations = await ProductLocationMap.find({});
    return allLocations.filter(location => 
      location.products.some(product => product.id === productId)
    );
  },

  /**
   * Fetches locations based on a given state/province code.
   * @param {string} code - The state/province code to search within.
   * @returns {Array} - Array of matching state location records.
   */
  fetchLocationByState: async (code) => {
    const stateRecord = await States.findOne({ code });
    if (!stateRecord) {
      console.log(`No state found with code: ${code}`);
      return [];
    }
    const stateId = stateRecord.id;
    const allStates = await StateLocationMap.find({});
    const filteredStates = allStates.filter(location =>
      location.states.some(state => state.id === stateId)
    );
    return filteredStates;
  }
};