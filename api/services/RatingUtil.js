 module.exports = {
    calculateRatings:(ratings) => {
    if (ratings.length > 0) {
      const priceAvg = ratings.reduce((sum, rating) => sum + parseFloat(rating.price), 0) / ratings.length;
      const speedAvg = ratings.reduce((sum, rating) => sum + parseFloat(rating.speed), 0) / ratings.length;
      const commAvg = ratings.reduce((sum, rating) => sum + parseFloat(rating.communication), 0) / ratings.length;
  
      const overallAvgRating = Math.round((priceAvg + speedAvg + commAvg) / 3); // Round to nearest whole number
        // console.log("overall avg ======<", overallAvgRating);
        
      return {
        avgPriceRating: Math.round(priceAvg),
        avgSpeedRating: Math.round(speedAvg),
        avgCommRating: Math.round(commAvg),
        overallAvgRating,
      };
    } else {
      // Return 0 ratings if no ratings exist
      return {
        avgPriceRating: 0,
        avgSpeedRating: 0,
        avgCommRating: 0,
        overallAvgRating: 0,
      };
    }
  },

};
  