const cron = require('node-cron');


/**
 * Update product meta on daily basis
 * */
cron.schedule('0 3 * * *', async () => {
  try {
    const response = await ShopifyService.getProductList(); //! needs decrypted base url to run now
    const products = response.data.products;
    for (let product of products) {
      const variants = product.variants;
      if (!_.isEmpty(variants)) {
        for (let variant of variants) {
          let imageUrl = '';
          const images = product.images;
          const matchingImages = images.filter(img => img.variant_ids.includes(parseInt(variant.id)));
          if (!_.isEmpty(matchingImages)) {
            imageUrl = matchingImages[0].src;
          }
          else {
            if (!_.isEmpty(images)) {
              imageUrl = images[0].src;
            }
          }
          let data = {
            weight: variant.weight,
            weightUnit: variant.weight_unit,
            handle: `${product.handle}?variant=${variant.id}`,
            imageUrl,
          };
          const variantData = await ProductMeta.findOne({ productId: product.id, variantId: variant.id });
          if (variantData) {
            await ProductMeta.update({ productId: product.id, variantId: variant.id }).set(data);
            sails.log.debug('records updated');
          }
          else {
            data['productId'] = product.id;
            data['variantId'] = variant.id;
            await ProductMeta.create(data);
            sails.log.debug('new records crated');
          }
        }
      }
    }
  }
  catch (e) {
    sails.log.error(e);
  }
});
