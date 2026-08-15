import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        const { data: revs } = await api.get(`/reviews/${id}`);
        setReviews(revs);
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post('/cart/add', { productId: id, quantity: qty });
      toast.success('Added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post('/reviews', { productId: id, rating, comment });
      toast.success('Review submitted');
      const { data: revs } = await api.get(`/reviews/${id}`);
      setReviews(revs);
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center py-8">Product not found</div>;

  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
        {/* Product Image */}
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2 md:p-4 h-64 sm:h-96">
          <img
            src={product.image}
            alt={product.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-3 md:space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {product.title}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Sold by {product.sellerId?.name}
            </p>
          </div>

          {/* Rating */}
          <div className="text-yellow-500 flex items-center space-x-2">
            <span className="text-lg md:text-2xl">★</span>
            <span className="text-base md:text-lg font-semibold text-gray-900">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-gray-400 text-xs md:text-sm">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <h2 className="text-2xl md:text-4xl font-extrabold text-blue-600">
            ₹{product.price.toFixed(2)}
          </h2>

          {/* Description */}
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            {product.description}
          </p>

          {/* Add to Cart Section */}
          {user?.role === 'customer' && (
            <div className="pt-3 md:pt-4 border-t space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-gray-700 font-medium text-sm md:text-base">
                  Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-20 px-3 py-2 border rounded-md text-sm"
                />
                <span className="text-xs md:text-sm text-gray-500">
                  {product.stock} pieces available
                </span>
              </div>

              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className={`w-full py-2 md:py-3 px-4 rounded-md font-bold text-white shadow transition-colors text-sm md:text-base ${
                  product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-6 md:pt-8 border-t">
        <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Customer Reviews</h3>

        {/* Write Review Form */}
        {user && user.role === 'customer' && (
          <form onSubmit={submitReview} className="mb-6 md:mb-8 bg-gray-50 p-3 md:p-6 rounded-lg shadow-sm space-y-3">
            <h4 className="font-semibold text-sm md:text-base">Write a Review</h4>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-sm md:text-base font-medium">Rating:</label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="border p-2 rounded text-xs md:text-sm"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full border p-2 md:p-3 rounded-md text-sm"
              rows="3"
              placeholder="What did you like or dislike about this product?"
              required
            ></textarea>

            <button
              type="submit"
              className="w-full md:w-auto bg-green-600 text-white px-4 md:px-6 py-2 rounded shadow hover:bg-green-700 text-sm md:text-base font-medium transition"
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-3 md:space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base">No reviews yet. Be the first!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="border-b pb-3 md:pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <div className="font-semibold text-sm md:text-base">{review.userId?.name}</div>
                  <div className="text-yellow-500 text-sm">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
