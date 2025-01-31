const ResponseService = require("../services/ResponseService");
const Joi = require("joi");

module.exports = {
  //   createProductRule: async (req, res) => {
  //     try {
  //       const data = req.body;

  //       const schema = Joi.object({
  //         locationId: Joi.string().required(),
  //         locationName: Joi.string(),
  //         products: Joi.array()
  //           .items(
  //             Joi.object({
  //               id: Joi.number().required(),
  //               title: Joi.string().required(),
  //             })
  //           )
  //           .min(1)
  //           .required(),
  //       });

  //       const validateResult = schema.validate(data);

  //       if (validateResult.error) {
  //         return ResponseService.jsonResponse(
  //           res,
  //           ConstantService.requestCode.BAD_REQUEST,
  //           {
  //             error: validateResult.error.message,
  //           }
  //         );
  //       }

  //       const isProductRuleAlreadyCreated = await ProductLocationMap.count({
  //         locationId: data.locationId,
  //         locationName: data.locationName,
  //       });

  //       if (isProductRuleAlreadyCreated) {
  //         return ResponseService.jsonResponse(
  //           res,
  //           ConstantService.requestCode.BAD_REQUEST,
  //           {
  //             message:
  //               ConstantService.responseMessage
  //                 .SORRY_THIS_PRODUCT_RULE_IS_ALREADY_AVAILABLE,
  //           }
  //         );
  //       }

  //       await ProductLocationMap.create({
  //         locationId: data.locationId,
  //         locationName: data.locationName,
  //         products: data.products,
  //       });

  //       return res.ok({});
  //     } catch (e) {
  //       console.log(e);
  //       return ResponseService.jsonResponse(
  //         res,
  //         ConstantService.requestCode.BAD_REQUEST,
  //         { message: "Error creating product rule" }
  //       );
  //     }
  //   },

  createProductRule: async (req, res) => {
    try {
      sails.log.info("====================== CREATE PRODUCT RULE REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);

      const data = req.body;

      // Define the validation schema
      const schema = Joi.object({
        locationId: Joi.string().required(),
        locationName: Joi.string().required(),
        products: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().required(),
              title: Joi.string().required(),
            })
          )
          .min(1)
          .required(),
      });

      // Validate the request data
      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: error.message,
          }
        );
      }

      const { locationId, locationName, products } = value;

      // Check if a product rule with the given locationId and locationName exists
      const existingRule = await ProductLocationMap.findOne({
        locationId,
        locationName,
      });
      console.log(" existingRule =====================>",existingRule);
      if (existingRule) {
        // Existing products in the rule
        const existingProducts = existingRule.products || [];
        console.log(" existingProducts =====================>",existingProducts);
        // Create a set of existing product IDs for quick lookup
        const existingProductIds = new Set(existingProducts.map((p) => p.id));
        console.log(" existingProductIds =====================>",existingProductIds);
        // Filter out products that already exist to prevent duplicates
        const newUniqueProducts = products.filter(
          (p) => !existingProductIds.has(p.id)
        );

        console.log(" newUniqueProducts =====================>",newUniqueProducts);

        if (newUniqueProducts.length === 0) {
          return res.ok({
            message: "No new unique products to add.",
          });
        }

        // Append new unique products to the existing products array
        const updatedProducts = existingProducts.concat(newUniqueProducts);

        // Update the record with the new products array
        const updatedRule = await ProductLocationMap.updateOne({
          id: existingRule.id,
        }).set({
          products: updatedProducts,
        }).fetch();

        console.log(" updatedRule =====================>",updatedRule);
        return res.ok({
          message: "Product rule updated successfully.",
          data: updatedRule,
        });
      } else {
        // Create a new product rule since it does not exist
        const newRule = await ProductLocationMap.create({
          locationId,
          locationName,
          products,
          brandId:req.sessionData.brand.id,
        }).fetch();

        return res.ok({
          message: "Product rule created successfully.",
          data: newRule,
        });
      }
    } catch (e) {
      console.error("Error in createOrUpdateProductRule:", e);
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.INTERNAL_SERVER_ERROR,
        {
          message: "Error creating or updating product rule.",
        }
      );
    }
  },

  //   // Optional: Implement deleteProductRule if needed
  //   deleteProductRule: async (req, res) => {
  //     try {
  //       const data = req.query;

  //       // Define the validation schema
  //       const schema = Joi.object({
  //         id: Joi.number().required(),
  //       });

  //       // Validate the request data
  //       const { error, value } = schema.validate(data);

  //       if (error) {
  //         return ResponseService.jsonResponse(res, ConstantService.requestCode.BAD_REQUEST, {
  //           error: error.message,
  //         });
  //       }

  //       const { id } = value;

  //       // Attempt to destroy the product rule
  //       const deletedRule = await ProductLocationMap.destroyOne({ id });

  //       if (!deletedRule) {
  //         return ResponseService.jsonResponse(res, ConstantService.requestCode.NOT_FOUND, {
  //           message: 'Product rule not found.',
  //         });
  //       }

  //       return res.ok({ message: 'Product rule deleted successfully.' });
  //     } catch (e) {
  //       console.error('Error deleting product rule:', e);
  //       return ResponseService.jsonResponse(res, ConstantService.requestCode.INTERNAL_SERVER_ERROR, {
  //         message: 'Error deleting product rule.',
  //       });
  //     }
  //   },

  editProductRule: async (req, res) => {
    try {
      sails.log.info("====================== EDIT PRODUCT RULE REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);

      const data = req.body;

      const schema = Joi.object({
        id: Joi.number().required(),
        locationId: Joi.string().required(),
        locationName: Joi.string().required(),
        products: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().required(),
              title: Joi.string().required(),
            })
          )
          .min(1)
          .required(),
      });

      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: error.message,
          }
        );
      }

      const { id, locationId, locationName, products } = value;

      const existingRule = await ProductLocationMap.find({
        locationId,
        locationName,
        id: { "!=": id },
      });
      if (existingRule.length > 0) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            message:
              ConstantService.responseMessage
                .SORRY_THIS_PRODUCT_RULE_IS_ALREADY_AVAILABLE,
          }
        );
      }

      const updatedRule = await ProductLocationMap.updateOne({ id }).set({
        locationId,
        locationName,
        products,
      });

      if (!updatedRule) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.NOT_FOUND,
          {
            message: "Product rule not found.",
          }
        );
      }

      return res.ok({
        message: "Product rule updated successfully.",
        data: updatedRule,
      });
    } catch (e) {
      console.error("Error updating product rule:", e);
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.INTERNAL_SERVER_ERROR,
        {
          message: "Error updating product rule.",
        }
      );
    }
  },

  /**
   * Delete Product Rule
   * API Endpoint :   /rule/product-rule/remove
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request containing rule ID.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and deletion status or relevant error code with message.
   */
  deleteProductRule: async (req, res) => {
    try {
      sails.log.info("====================== DELETE PRODUCT RULE REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);

      const data = req.query;

      const schema = Joi.object({
        id: Joi.number().required(),
      });

      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      await ProductLocationMap.destroy({ id: data.id });
      return res.ok({});
    } catch (e) {
      return ResponseService.error(res, e, "Error destroying product rule");
    }
  },

  /**
   * Create ZIP Code Rule
   * API Endpoint :   /rule/zip-rule/create
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing ZIP code rules.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and created rule or relevant error code with message.
   */
  createZipRule: async (req, res) => {
    try {
      sails.log.info("====================== CREATE ZIP RULE REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);

      const data = req.body;

      const schema = Joi.object({
        zipMin: Joi.number().min(10000).max(99999).required(),
        zipMax: Joi.number().min(10000).max(99999).required(),
        locationId: Joi.string().required(),
      });
      const validateResult = schema.validate(data);

      if (validateResult.error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: validateResult.error.message,
          }
        );
      }

      await LocationMap.create({
        zipMin: data.zipMin,
        zipMax: data.zipMax,
        locationId: data.locationId,
      });
      return res.ok({});
    } catch (e) {
      return ResponseService.error(res, e, "Error creating location rule");
    }
  },

  /**
   * Create State Rule
   * API Endpoint :   /rule/state-rule/create
   * API Method   :   POST
   *
   * @param   {Object}        req          Request Object From API Request containing state rules.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and created rule or relevant error code with message.
   */
  createStateRule: async (req, res) => {
    try {
      sails.log.info("====================== CREATE STATE RULE REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);

      const data = req.body;

      // Define the validation schema
      const schema = Joi.object({
        products: Joi.array().items(
          Joi.object({
            id: Joi.required(),
            title: Joi.required(),
          }).required()
        ),
        locationId: Joi.string().required(),
        locationName: Joi.string().required(),
        states: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().required(),
              name: Joi.string().required(),
            })
          )
          .min(1)
          .required(),
      });

      // Validate the request data
      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: error.message,
          }
        );
      }

      const { products, locationId, locationName, states } = value;

      // Extract the first product's ID and name for checking the existing rule
      // You can change this if your logic needs to handle multiple products
      const productIds = products.map((product) => product.id);
      const productNames = products.map((product) => product.title);

      // Check if a state rule with the given products, locationId, and locationName exists
      const existingRule = await StateLocationMap.findOne({
        where: {
          locationId,
          locationName,
          // For simplicity, you could use the first productId/title for this check, or adjust as needed
          products: { in: productIds }, // This checks if any of the products match
        },
      });

      if (existingRule) {
        // Existing states in the rule
        const existingStates = existingRule.states || [];

        // Create a set of existing state IDs for quick lookup
        const existingStateIds = new Set(existingStates.map((s) => s.id));

        // Filter out states that already exist to prevent duplicates
        const newUniqueStates = states.filter(
          (s) => !existingStateIds.has(s.id)
        );

        if (newUniqueStates.length === 0) {
          return ResponseService.jsonResponse(
            res,
            ConstantService.requestCode.BAD_REQUEST,
            {
              message: "No new unique states to add.",
            }
          );
        }

        // Append new unique states to the existing states array
        const updatedStates = existingStates.concat(newUniqueStates);
        console.log(" updatedStates =====================>",updatedStates);

        // Update the record with the new states array
        const updatedRule = await StateLocationMap.updateOne({
          id: existingRule.id,
        }).set({
          products, // Update the products array as well
          states: updatedStates,
        }).fetch();
        console.log(" updatedRule =====================>",updatedRule);
        return res.ok({
          message: "State rule updated successfully.",
          data: updatedRule,
        });
      } else {
        // Create a new state rule since it does not exist
        const newRule = await StateLocationMap.create({
          products, // Store the entire products array
          locationId,
          locationName,
          states,
          brandId:req.sessionData.brand.id,
        }).fetch();

        return res.ok({
          message: "State rule created successfully.",
          data: newRule,
        });
      }
    } catch (e) {
      console.error("Error in createOrUpdateStateRule:", e);
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.INTERNAL_SERVER_ERROR,
        {
          message: "Error creating or updating state rule.",
        }
      );
    }
  },

  //   createStateRule: async (req, res) => {
  //     try {
  //       const data = req.body;

  //       const schema = Joi.object({
  //         productId: Joi.string().required(),
  //         productName: Joi.string(),
  //         locationId: Joi.string().required(),
  //         locationName: Joi.string(),
  //         states: Joi.array()
  //           .items(
  //             Joi.object({
  //               id: Joi.number().required(),
  //               name: Joi.string().required(),
  //             })
  //           )
  //           .min(1)
  //           .required(),
  //       });

  //       const validateResult = schema.validate(data);

  //       if (validateResult.error) {
  //         return ResponseService.jsonResponse(
  //           res,
  //           ConstantService.requestCode.BAD_REQUEST,
  //           {
  //             error: validateResult.error.message,
  //           }
  //         );
  //       }

  //       const isStateRuleAlreadyCreated = await StateLocationMap.count({
  //         productId: data.productId,
  //         productName: data.productName,
  //         locationId: data.locationId,
  //         locationName: data.locationName,
  //       });

  //       if (isStateRuleAlreadyCreated) {
  //         return ResponseService.jsonResponse(
  //           res,
  //           ConstantService.requestCode.BAD_REQUEST,
  //           {
  //             message:
  //               ConstantService.responseMessage
  //                 .SORRY_THIS_STATE_RULE_IS_ALREADY_AVAILABLE,
  //           }
  //         );
  //       }

  //       await StateLocationMap.create({
  //         states: data.states,
  //         productId: data.productId,
  //         productName: data.productName,
  //         locationId: data.locationId,
  //         locationName: data.locationName,
  //       });

  //       return res.ok({});
  //     } catch (e) {
  //       console.log(e);
  //       return ResponseService.jsonResponse(
  //         res,
  //         ConstantService.requestCode.BAD_REQUEST,
  //         { message: "Error creating location rule" }
  //       );
  //     }
  //   },

  editStateRule: async (req, res) => {
    try {
      sails.log.info("====================== EDIT STATE RULE REQUEST ==============================\n");
      sails.log.info("REQ BODY : ", req.body);

      const data = req.body;
      // Define the validation schema
      const schema = Joi.object({
        id: Joi.number().required(),
        products: Joi.array()
          .items(
            Joi.object({
              id: Joi.required(),
              title: Joi.required(),
            }).required()
          )
          .required(),
        locationId: Joi.string().required(),
        locationName: Joi.string().required(),
        states: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().required(),
              name: Joi.string().required(),
            })
          )
          .min(1)
          .required(),
      });

      // Validate the request data
      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: error.message,
          }
        );
      }

      const { id, products, locationId, locationName, states } = value;

      // Extract product IDs and titles
      const productIds = products.map((product) => product.id);
      const productNames = products.map((product) => product.title);

      // Check if a state rule with the same products, locationId, and locationName already exists
      const existingRule = await StateLocationMap.findOne({
        where: {
          locationId,
          locationName,
          // Check if the products array already contains the same product IDs (excluding current rule)
          products: { in: productIds }, // This can be adjusted if you need a more complex check
          id: { "!=": id }, // Exclude the current rule
        },
      });

      if (existingRule) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            message:
              ConstantService.responseMessage
                .SORRY_THIS_STATE_RULE_IS_ALREADY_AVAILABLE,
          }
        );
      }

      // Update the state rule
      const updatedRule = await StateLocationMap.updateOne({ id }).set({
        products, // Update the entire products array
        locationId,
        locationName,
        states,
      });

      if (!updatedRule) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.NOT_FOUND,
          {
            message: "State rule not found.",
          }
        );
      }

      return res.ok({
        message: "State rule updated successfully.",
        data: updatedRule,
      });
    } catch (e) {
      console.error("Error updating state rule:", e);
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.INTERNAL_SERVER_ERROR,
        {
          message: "Error updating state rule.",
        }
      );
    }
  },

  /**
   * Delete State Rule
   * API Endpoint :   /rule/state-rule/remove
   * API Method   :   DELETE
   *
   * @param   {Object}        req          Request Object From API Request containing rule ID.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and deletion status or relevant error code with message.
   */
  deleteStateRule: async (req, res) => {
    try {
      sails.log.info("====================== DELETE STATE RULE REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);

      const data = req.query;

      const schema = Joi.object({
        id: Joi.number().required(),
      });

      const { error, value } = schema.validate(data);

      if (error) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            error: error.message,
          }
        );
      }

      const { id } = value;

      const deletedRule = await StateLocationMap.destroyOne({ id });

      if (!deletedRule) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.NOT_FOUND,
          {
            message: "State rule not found.",
          }
        );
      }

      return res.ok({ message: "State rule deleted successfully." });
    } catch (e) {
      console.error("Error deleting state rule:", e);
      return ResponseService.jsonResponse(
        res,
        ConstantService.requestCode.INTERNAL_SERVER_ERROR,
        {
          message: "Error deleting state rule.",
        }
      );
    }
  },

  getRuleList: async (req, res) => {
    try {
      const productRules = await ProductLocationMap.find({});
      const stateRules = await StateLocationMap.find({});
      return res.ok({ productRules, stateRules });
    } catch (e) {
      return ResponseService.error(res, e, "Error fetching rules");
    }
  },

  getProductRuleList: async (req, res) => {
    try {
      const currentBrandId = req.sessionData.brand.id;
      const productRules = await ProductLocationMap.find({ brandId: currentBrandId});
      return res.ok({ productRules });
    } catch (e) {
      return ResponseService.error(res, e, "Error fetching rules");
    }
  },

  /**
   * Get State Rules List
   * API Endpoint :   /rule/state-rules
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and state rules list or relevant error code with message.
   */
  getStateRuleList: async (req, res) => {
    try {
      const currentBrandId = req.sessionData.brand.id;
      const stateRules = await StateLocationMap.find({ brandId: currentBrandId });
      return res.ok({ stateRules });
    } catch (e) {
      return ResponseService.error(res, e, "Error fetching rules");
    }
  },

  /**
   * Get Available States
   * API Endpoint :   /rule/available-states
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing locationId and productIds.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and available states list or relevant error code with message.
   */
  getAvailableStates: async (req, res) => {
    try {
      const { locationId, productIds } = req.query;
      const parsedProductIds = JSON.parse(productIds);
      const parsedLocationId = JSON.parse(locationId);
      console.log(parsedProductIds, parsedLocationId);
      if (
        !parsedLocationId ||
        !parsedProductIds ||
        !Array.isArray(parsedProductIds)
      ) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            message: "locationId and an array of productsIds are required",
          }
        );
      }

      // Extract product IDs from the products array
      const products = parsedProductIds.map((product) => product.id);

      // Query to find existing states for the provided locationId and products
      const existingStates = await StateLocationMap.find({
        where: { locationId },
        select: ["states", "products"],
      });

      // Filter records based on matching product IDs in the 'products' field
      const filteredStates = existingStates.filter((state) => {
        // Check if any product's id matches the productIds array
        return state.products.some((product) =>
          parsedProductIds.includes(product.id)
        );
      });
      const existingStateIds = filteredStates
        .map((rule) => rule.states)
        .flat()
        .map((st) => st.id);

      const allStates = await States.find({});

      const availableStates = allStates.filter(
        (st) => !existingStateIds.includes(st.id)
      );

      return res.ok(availableStates);
    } catch (e) {
      return ResponseService.error(res, e, "Error fetching available states");
    }
  },

  /**
   * Get Available Products
   * API Endpoint :   /rule/available-products
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing locationId.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and available products list or relevant error code with message.
   */
  getAvailableProducts: async (req, res) => {
    try {
      const { locationId } = req.query;

      if (!locationId) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            message: "locationId is required",
          }
        );
      }

      const existingProducts = await ProductLocationMap.find({
        where: {
          locationId,
        },
        select: ["products"],
      });

      const existingProductIds = existingProducts
        .map((rule) => rule.products)
        .flat()
        .map((product) => product.id);

        const encrypted_details = await sails.helpers.fetchLoggedInUsersEncryptedData.with({ req });
        // console.log(" encrypted_details =====================>",encrypted_details);
        const decryptedData = EncryptionService.decryptData(encrypted_details);
        // console.log(" decryptedData =====================>",decryptedData);
        const BASE_URL = EncryptionService.decryptDataToBASE_URL(decryptedData);
        // console.log(" BASE_URL =====================>",BASE_URL);
      const allProducts = await ShopifyService.getProductList(BASE_URL);

      const availableProducts = allProducts.data.products.filter(
        (product) => !existingProductIds.includes(product.id)
      );

      return res.ok(availableProducts);
    } catch (e) {
      return ResponseService.error(
        res,
        e,
        "Error fetching available locations"
      );
    }
  },
};
