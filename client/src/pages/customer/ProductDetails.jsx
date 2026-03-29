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
  if (!product) return <div>Product not found</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.image} alt={product.title} className="w-full h-96 object-cover rounded-lg" />
        </div>
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-gray-500 text-sm">Sold by {product.sellerId?.name}</p>
          <div className="text-yellow-500 flex items-center space-x-1">
            <span className="text-2xl">★</span>
            <span className="text-xl">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
          </div>
          <h2 className="text-4xl font-extrabold text-blue-600">₹{product.price}</h2>
          <p className="text-gray-700">{product.description}</p>
          
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-gray-700 font-medium">Quantity:</label>
              <input 
                type="number" 
                min="1" 
                max={product.stock} 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))} 
                className="w-20 px-3 py-2 border rounded-md"
              />
              <span className="text-sm text-gray-500">{product.stock} pieces available</span>
            </div>
            
            <button 
              onClick={addToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 px-4 rounded-md font-bold text-white shadow transition-colors ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
        
        {user && user.role === 'customer' && (
          <form onSubmit={submitReview} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-2">Write a Review</h4>
            <div className="flex items-center space-x-4 mb-4">
              <label>Rating:</label>
              <select value={rating} onChange={e => setRating(e.target.value)} className="border p-2 rounded">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              className="w-full border p-3 rounded-md mb-4" 
              rows="3" 
              placeholder="What did you like or dislike about this product?" 
              required
            ></textarea>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700">Submit Review</button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center space-x-2">
                  <div className="font-semibold">{review.userId?.name}</div>
                  <div className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
                  <div className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
