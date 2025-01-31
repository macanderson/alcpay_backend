const Joi = require('joi');
const ConstantService = require('../services/ConstantService');
const ShopifyService = require('../services/ShopifyService');
const EncryptionService = require('../services/EncryptionService');
const { syncProducts } = require('../services/ProductSync');
const UserService = require("../services/UserService");

module.exports = {
    /**
     * @DEPRECATED
     * Update Brand Password
     * API Endpoint :   /public/brand/update-password
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request containing old and new password.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and update status or relevant error code with message.
     */
    updatePassword: async (req, res) => {
        try {
            sails.log.info("====================== UPDATE BRAND PASSWORD REQUEST ==============================\n");
            sails.log.info("REQ BODY : ", req.body);

            const updateRequest = {
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
            };

            const schema = Joi.object().keys({
                currentPassword: Joi.string().required(),
                newPassword: Joi.string().min(6).required(),
            });

            const validateResult = schema.validate(updateRequest);

            if (validateResult.error) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    {
                        error: validateResult.error.message,
                    }
                );
            }

            const userId = req.sessionData.id;
            if (!userId) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.UNAUTHORIZED,
                    {
                        message: 'User is not logged in.',
                    }
                );
            }

            let userDetails = await User.findOne({ id: userId });

            if (!userDetails) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.NOT_FOUND,
                    {
                        message: 'Brand not found.',
                    }
                );
            }

            const isSamePassword = await BCryptService.isSamePassword(
                updateRequest.currentPassword,
                userDetails.password
            );

            if (!isSamePassword) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    {
                        message: 'Current password is incorrect.',
                    }
                );
            }
            const hashedNewPassword = await BCryptService.encryptedPassword(
                updateRequest.newPassword
            );

            await User.updateOne({ id: userId }).set({
                password: hashedNewPassword,
            });

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message: 'Password updated successfully.',
                }
            );
        } catch (exception) {
            sails.log.error(exception);
            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Error during password update.'
            );
        }
    },

    /**
     * Register Brand
     * API Endpoint :   /public/brand/register
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request containing brand registration details.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and brand info or relevant error code with message.
     */
    registerBrand: async (req, res) => {
        try {
            sails.log.info("====================== REGISTER BRAND REQUEST ==============================\n");
            sails.log.info("REQ BODY : ", req.body);

            const createRequest = {
                brandName: req.body.brandName,
                email: req.body.email,
                password: req.body.password,
                contact: req.body.contact,
                website: req.body.website,
                accountId: req.body.accountId,
            };

            const schema = Joi.object().keys({
                brandName: Joi.string(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                contact: Joi.string(),
                website: Joi.string().uri(),
                accountId: Joi.string(),
            });

            const validateResult = schema.validate(createRequest);

            if (validateResult.error) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    {
                        error: validateResult.error.message,
                    }
                );
            }

            const hashedPassword = await BCryptService.encryptedPassword(
              createRequest.password
            );

            // create user
            const user = await User.create({
                name: createRequest.brandName,
                email: createRequest.email,
                password: hashedPassword,
                // isActive: false, // Set to false for email verification
                isActive: true, //! Default true; update later for email verification
                roleId: ConstantService.userType.BRAND,
                contact: createRequest.contact,
            }).fetch();

            user.brand = [await Brands.create({
                website: createRequest.website,
                brandName: createRequest.brandName,
                user: user.id,
            }).fetch()];

            const accessId = user.roleId + (user.id + '').padStart(6, '0');
            const jwtToken = await JwtService.issueNewAccessToken(user, accessId);

            const response = {
                accessToken: jwtToken.accessToken,
                roleId: ConstantService.userType.BRAND,
                user: UserService.toResponse(user),
                isSuperAdmin: false,
            };

            // const verificationLink = `${process.env.WEB_HOST}/verify-email?token=${jwtToken.accessToken}`;
            // const emailContent = `
            //     <p>Hi ${newBrand.brandName},</p>
            //     <p>Thank you for registering with us. Please verify your email by clicking the link below:</p>
            //     <p><a href="${verificationLink}">Verify Email</a></p>
            //     <p>If you did not request this, please ignore this email.</p>
            // `;

            // await MailService.sendEmailToAccount(
            //     newBrand.email,
            //     'Please verify your email',
            //     emailContent,
            //     true
            // );

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message: 'Brand registered successfully. Please check your email to verify your account.',
                    data: response,
                }
            );
        } catch (exception) {
            sails.log.error(exception);
            // Check for duplicate email error (MySQL error code 1062)
            if (
                exception.code === 'E_UNIQUE' ||
                (exception.original && exception.original.code === 'ER_DUP_ENTRY')
            ) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    {
                        message: 'Email already exists. Please use a different email.',
                    }
                );
            }
            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Error during brand registration.'
            );
        }
    },

    /**
     * Get All Brands
     * API Endpoint :   /public/brand/all
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request with pagination and filtering params.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and list of brands or relevant error code with message.
     */
    getAllBrands: async (req, res) => {
        try {
            sails.log.info("====================== GET ALL BRANDS REQUEST ==============================\n");
            sails.log.info("REQ QUERY : ", req.query);

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            // Filters
            const brandNameFilter = req.query.brandName || '';
            const createdDate = req.query.createdDate || '';  // A single date value in Unix timestamp
            // const retailerFilter = req.query.retailer || '';  // Assuming it will be added to the model

            // Prepare where conditions
            let whereConditions = {};

            // Filter by brandName
            if (brandNameFilter) {
                whereConditions.brandName = { contains: brandNameFilter };
            }

            // Filter by createdAt (single date in Unix timestamp)
            if (createdDate) {
                const timestamp = parseInt(createdDate, 10);
                const date = new Date(timestamp);
                const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();  // Start of the day
                const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime(); // End of the day
                whereConditions.createdAt = { '>=': startOfDay, '<=': endOfDay };  // Filtering for the entire day
            }

            // // Filter by retailer (once retailer is added to model schema)
            // if (retailerFilter) {
            //     whereConditions.retailer = { contains: retailerFilter };  // Assuming a retailer field is added to model
            // }

            // Count total brands with the applied filters
            const totalBrands = await Brands.count({ where: whereConditions });

            // Fetch the filtered brands
            const brands = await Brands.find({
                select: [
                    'id',
                    'brandName',
                    'website',
                    'commission',
                    "createdAt",
                    "storeName"
                ],
                where: whereConditions,
                skip: offset,
                limit: limit,
            }).populate('user');

            return res.status(200).json({
                message: 'Brands retrieved successfully.',
                data: brands.map(brand => ({...brand.user, ...brand})),
                page: page.toString(),
                pageSize: limit.toString(),
                total: totalBrands,
            });
        } catch (exception) {
            sails.log.error(exception);
            return res.status(500).json({
                message: 'Error retrieving brands.',
                error: exception.message,
            });
        }
    },
    /**
     * Update Brand Details
     * API Endpoint :   /public/brand/update-details
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request containing brand details to update.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and updated brand or relevant error code with message.
     */
    updateDetails: async (req, res) => {
        try {
            sails.log.info("====================== UPDATE BRAND DETAILS REQUEST ==============================\n");
            sails.log.info("REQ BODY : ", req.body);

            const updateRequest = {
                brandName: req.body.brandName,
                website: req.body.website,
                accountId: req.body.accountId,
                contact: req.body.contact,
                email: req.body.email,
            };
            // console.log("SESSION DATA =======================> ", req.sessionData);

            // Validation schema
            const schema = Joi.object().keys({
                brandName: Joi.string().optional(),
                website: Joi.string().uri().optional(),
                accountId: Joi.string().optional(),
                contact: Joi.string().optional(),
                email: Joi.string().email(),
            });

            const validateResult = schema.validate(updateRequest);

            if (validateResult.error) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    {
                        error: validateResult.error.message,
                    }
                );
            }

            // Assuming the logged-in user has their id available in req.sessionData or similar
            const userId = req.sessionData.id; // Adjust this if your session stores the brand ID elsewhere

            // Check if the brand exists
            const brandDetails = await Brands.findOne({ user: userId });

            if (!brandDetails) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.NOT_FOUND,
                    {
                        message: 'Brand not found.',
                    }
                );
            }

            // Update the brand details
            const updatedBrand = await Brands.update({ id: brandDetails.id })
                .set(_.omit(updateRequest, ['email', 'contact']))
                .fetch();

            const updatedUser = await User.update({ id: userId })
                .set(_.pick(updateRequest, ['email', 'contact']))
                .fetch();

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message: 'Brand details updated successfully.',
                    data: {..._.omit(updatedUser[0], ['password']), ...updatedBrand[0]},
                }
            );
        } catch (exception) {
            sails.log.error(exception);
            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Error updating brand details.'
            );
        }
    },

    /**
     * Save Encrypted Shopify Store Details
     * API Endpoint :   /public/brand/save-shopify-info
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request containing Shopify store details.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and encryption status or relevant error code with message.
     */
    encryptData: async (req, res) => {
        try {
            sails.log.info("====================== SAVE SHOPIFY INFO REQUEST ==============================\n");
            sails.log.info("REQ BODY : ", req.body);

            const brandId = req.sessionData.brand.id;

            const brandRequest = {
                brandId: brandId,
                STORE_ACCESS_ID: req.body.STORE_ACCESS_ID,
                STORE_PASSWORD: req.body.STORE_PASSWORD,
                STORE_URL: req.body.STORE_URL,
                API_VERSION: req.body.API_VERSION,
            };
            console.log("1. ",brandRequest);
            const storeName = brandRequest.STORE_URL;
            // Encrypt the data using the EncryptionService
            const encryptedData = EncryptionService.encryptData(brandRequest);
            // console.log("2. ", encryptedData);

            const brand = await Brands.update({ id: brandId })
                .set({ encrypted_details: encryptedData , storeName: storeName })
                .fetch();

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message:
                        'Brand data encrypted and saved successfully. Now you can sync shopify products. ',
                    data: brand,
                }
            );
        } catch (exception) {
            sails.log.error(exception);
            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Error encrypting brand data.'
            );
        }
    },

    /**
     * Get Decrypted Brand Details
     * API Endpoint :   /public/brand/fetch-shopify-data
     * API Method   :   POST
     *
     * @param   {Object}        req          Request Object From API Request.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and decrypted data or relevant error code with message.
     */
    decryptData: async (req, res) => {
        try {
            sails.log.info("====================== FETCH SHOPIFY DATA REQUEST ==============================\n");

            const brandId = req.sessionData.brand.id;
            const brand = await Brands.findOne({ id: brandId });

            if (!brand.encrypted_details) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.NOT_FOUND,
                    {
                        message: 'Brands encrypted data not found.',
                    }
                );
            }

            const decryptedData = EncryptionService.decryptData(brand.encrypted_details);
            const BASE_URL =  EncryptionService.decryptDataToBASE_URL(decryptedData);
            const Products = await ShopifyService.getProductList(BASE_URL);

            await syncProducts(brandId, Products);

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message: 'Brand data decrypted and synced successfully.',
                    // data: Products.data.products,
                }
            );
        } catch (exception) {
            sails.log.error(exception);
            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Error decrypting brand data.'
            );
        }
    },

    /**
     * Get Specific Brands
     * API Endpoint :   /public/brand/specific
     * API Method   :   GET
     *
     * @param   {Object}        req          Request Object From API Request with filtering params.
     * @param   {Object}        res          Response Object For API Request.
     * @returns {Promise<*>}    JSONResponse With success code 200 and filtered brands or relevant error code with message.
     */
    getSpecificBrands: async (req, res) => {
        try {
            sails.log.info("====================== GET SPECIFIC BRANDS REQUEST ==============================\n");
            sails.log.info("REQ QUERY : ", req.query);

            const id = req.sessionData.role === ConstantService.userType.SUPER_ADMIN ? req.query.brand_id :
            (req.sessionData.role === ConstantService.userType.BRAND ? req.sessionData.brand.id : null);

            if (id === null) {
                return res.status(500).json({ message: 'Only Brand or Super Admin can use this API' });
            }


            const brand = await Brands.findOne({ id }).select([
                'brandName',
                'website',
                'accountId',
                'storeName',
            ]).populate('user');

            if (_.isEmpty(brand)) {
                return res.status(404).json({
                    message: 'No brand found.',
                    data: [],
                });
            }
            sails.log.debug(brand);

            return res.status(200).json({
                message: 'Brand retrieved successfully.',
                data: {...brand.user, ...brand},
            });
        } catch (exception) {
            sails.log.error(exception);
            return res.status(500).json({
                message: 'Error retrieving brand.',
                error: exception.message,
            });
        }
    },

    /**
   *
   * Update Brand Commission
   * API Endpoint :   /public/brand/handle-commission
   * API Method   :   PUT
   *
   * @param   {Object}        req          Request Object From API Request containing brand_id and commission.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and updated brand or relevant error code with message.
   */
    updateCommission: async (req, res) => {
        try {
            sails.log.info("====================== UPDATE BRAND COMMISSION REQUEST ==============================\n");
            sails.log.info("REQ BODY : ", req.body);

            const brandRequest = {
                brand_id: req.body.brand_id,
                commission: req.body.commission,
            };

            // Validation schema
            const schema = Joi.object().keys({
                brand_id: Joi.string().required(),
                commission: Joi.number().min(10).max(80).required(),
            });

            const validateResult = schema.validate(brandRequest);

            if (validateResult.error) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.BAD_REQUEST,
                    {
                        error: validateResult.error.message,
                    }
                );
            }

            // Check if the brand exists
            const brandDetails = await Brands.findOne({ id: brandRequest.brand_id });

            if (!brandDetails) {
                return ResponseService.jsonResponse(
                    res,
                    ConstantService.requestCode.NOT_FOUND,
                    {
                        message: 'Invalid Brand ID.',
                    }
                );
            }

            // Update the brand details
            await Brands.update({ id: brandRequest.brand_id })
              .set({ commission: brandRequest.commission })
              .fetch();

            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.SUCCESS,
                {
                    message: 'Commission Updated Successfully.',
                    // data: updatedBrand,
                }
            );
        } catch (error) {
            sails.log.error(error);
            return ResponseService.jsonResponse(
                res,
                ConstantService.requestCode.INTERNAL_SERVER_ERROR,
                'Something went wrong :('
            );
        }
    },
};
