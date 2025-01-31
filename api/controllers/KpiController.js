// Helper function for random colors
const getRandomColor = () => {
  const getComponent = () => Math.floor(Math.random() * 156) + 50; // Generates values between 50 and 205 for better visibility
  const r = getComponent();
  const g = getComponent();
  const b = getComponent();
  return `rgba(${r}, ${g}, ${b}, 0.9)`;
};

module.exports = {
  /**
   * Get Order Fulfillments KPI
   * API Endpoint :   /kpi/order-fulfillments
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing year and type query params.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and KPI data or relevant error code with message.
   */
  getOrderFullfillmentsKPI: async (req, res) => {
    try {
      sails.log.info("====================== GET ORDER FULFILLMENTS KPI REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);

      const { year, type } = req.query;

      if (!year || !type || !["count", "amount"].includes(type)) {
        return ResponseService.error(
          res,
          "Invalid query parameters",
          "Invalid query"
        );
      }

      const startDate = new Date(`${year}-01-01`);
      // console.log("startDate", startDate);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);
      // console.log("endDate", endDate);

      // Fetch all fulfillments within the specified year
      const fulfillments = await Fulfillment.find({
        where: { createdAt: { ">=": startDate, "<": endDate } },
      });

      // Extract unique account IDs
      const accountIds = [...new Set(fulfillments.map((f) => f.accountId))];
      // console.log("accountIds",accountIds);

      // Fetch corresponding accounts for the account IDs
      const accounts = await Account.find({ id: accountIds });

      // Create a mapping of accountId to businessName
      const accountNameMap = accounts.reduce((map, account) => {
        map[account.id] = account.businessName;
        return map;
      }, {});

      const monthlyData = {};

      fulfillments.forEach((f) => {
        const month = new Date(f.createdAt).getMonth();
        const accountId = f.accountId;
        const businessName =
          accountNameMap[accountId] || `Unknown (${accountId})`;

        if (!monthlyData[businessName]) {
          monthlyData[businessName] = Array(12).fill(0);
        }

        monthlyData[businessName][month] +=
          type === "count" ? 1 : f.amount || 0;
      });

      // Convert the data to the desired format
      const datasets = Object.entries(monthlyData).map(
        ([businessName, data]) => ({
          label: businessName,
          data,
          backgroundColor: getRandomColor(),
          borderRadius: 4,
        })
      );

      return res.ok({ datasets });
    } catch (e) {
      return ResponseService.error(
        res,
        e,
        "Unable to fetch fulfillment KPI data"
      );
    }
  },
  /**
   * Get Brand Fulfillments KPI
   * API Endpoint :   /kpi/brand-fulfillments
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request containing year and type query params.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and KPI data or relevant error code with message.
   */
  getBrandFulfillmentsKPI: async (req, res) => {
    try {
      sails.log.info("====================== GET BRAND FULFILLMENTS KPI REQUEST ==============================\n");
      sails.log.info("REQ QUERY : ", req.query);

      const { year, type } = req.query;

      // Step 1: Validate Query Parameters
      if (!year || !type || !["count", "amount"].includes(type)) {
        return ResponseService.jsonResponse(
          res,
          ConstantService.requestCode.BAD_REQUEST,
          {
            message: "Invalid query parameters",
            error: "Invalid query",
          }
        );
      }

      // Step 2: Define Date Range for the Specified Year
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);

      // Step 3: Fetch All Fulfillments Within the Specified Year
      const fulfillments = await Fulfillment.find({
        where: { createdAt: { ">=": startDate, "<": endDate } },
      });
      console.log("Fulfillments fetched:", fulfillments);

      // Step 4: Extract Unique Account IDs from Fulfillments
      const accountIds = [...new Set(fulfillments.map((f) => f.accountId))];
      console.log("Unique Account IDs:", accountIds);

      if (accountIds.length === 0) {
        return res.ok({ datasets: [] }); // No fulfillments found for the year
      }

      // Step 5: Fetch Accounts Based on Account IDs
      const accounts = await Account.find({ id: accountIds });
      console.log("Accounts fetched:", accounts);

      if (accounts.length === 0) {
        return res.ok({ datasets: [] }); // No accounts found
      }

      // Step 6: Extract Unique Location IDs from Accounts
      const locationIds = [...new Set(accounts.map((acc) => acc.locationId))];
      console.log("Unique Location IDs:", locationIds);

      if (locationIds.length === 0) {
        return res.ok({ datasets: [] }); // No location IDs found
      }

      // Step 7: Fetch State Location Maps Based on Location IDs
      const stateLocationMaps = await StateLocationMap.find({
        where: { locationId: locationIds },
        select: ["brandId", "locationId"],
      });
      console.log("StateLocationMaps fetched:", stateLocationMaps);

      if (stateLocationMaps.length === 0) {
        return res.ok({ datasets: [] }); // No state_location_map entries found
      }

      // Step 8: Extract Unique Brand IDs from State Location Maps
      const brandIds = [
        ...new Set(stateLocationMaps.map((map) => map.brandId)),
      ];
      console.log("Unique Brand IDs:", brandIds);

      if (brandIds.length === 0) {
        return res.ok({ datasets: [] }); // No brand IDs found
      }

      // Step 9: Fetch Brands Based on Brand IDs
      const brands = await Brands.find({ id: brandIds });
      console.log("Brands fetched:", brands);

      if (brands.length === 0) {
        return res.ok({ datasets: [] }); // No brands found
      }

      // Step 10: Create a Mapping from Brand ID to Brand Name
      const brandNameMap = brands.reduce((map, brand) => {
        map[brand.id] = brand.brandName;
        return map;
      }, {});
      console.log("Brand ID to Name Map:", brandNameMap);

      // Step 11: Create a Mapping from Location ID to Brand ID
      const locationToBrandMap = stateLocationMaps.reduce((map, entry) => {
        map[entry.locationId] = entry.brandId;
        return map;
      }, {});
      console.log("Location to Brand Map:", locationToBrandMap);

      // Step 12: Aggregate Fulfillments by Brand and Month
      const monthlyData = {};

      fulfillments.forEach((f) => {
        const month = new Date(f.createdAt).getMonth(); // 0-indexed (0 = January)
        const account = accounts.find((acc) => acc.id === f.accountId);
        if (!account) return; // Skip if account not found

        const brandId = locationToBrandMap[account.locationId];
        if (!brandId) return; // Skip if brandId not found

        const businessName =
          brandNameMap[brandId] || `Unknown Brand (${brandId})`;

        if (!monthlyData[businessName]) {
          monthlyData[businessName] = Array(12).fill(0); // Initialize array for 12 months
        }

        monthlyData[businessName][month] +=
          type === "count" ? 1 : f.amount || 0;
      });

      // Step 13: Convert Aggregated Data into Desired Format
      const datasets = Object.entries(monthlyData).map(
        ([businessName, data]) => ({
          label: businessName,
          data,
          backgroundColor: getRandomColor(),
          borderRadius: 4,
        })
      );

      return res.ok({ datasets });
    } catch (e) {
      console.error("Error in getBrandFulfillmentsKPI:", e);
      return ResponseService.error(
        res,
        e,
        "Unable to fetch brand fulfillment KPI data"
      );
    }
  },
};
