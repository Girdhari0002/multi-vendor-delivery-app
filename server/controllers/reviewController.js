import Review from '../models/Review.js';
import Product from '../models/Product.js';

// POST /api/reviews
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      productId: productId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = new Review({
      userId: req.user._id,
      productId,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Update Product average rating
    const reviews = await Review.find({ productId });
    const product = await Product.findById(productId);
    
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await product.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/:productId
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
