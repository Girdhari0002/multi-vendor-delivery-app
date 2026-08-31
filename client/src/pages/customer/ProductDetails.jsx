import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaStar, FaShoppingCart, FaMinus, FaPlus, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import ReviewCard from '../../components/ReviewCard';
import Card from '../../components/ui/Card';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
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

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await addToCart(id, qty);
      // toast is already handled inside addToCart context method
      navigate('/cart');
    } catch (error) {
      console.error(error);
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
      setRating(5);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const incrementQty = () => {
    if (qty < (product?.stock || 0) && qty < 10) setQty(qty + 1);
  };

  const decrementQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <Skeleton variant="text" width="200px" height="20px" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton variant="rectangular" height="400px" className="w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton variant="text" width="80%" height="40px" />
            <Skeleton variant="text" width="40%" height="24px" />
            <Skeleton variant="text" width="30%" height="32px" />
            <Skeleton variant="rectangular" height="150px" className="w-full" />
            <Skeleton variant="rectangular" height="50px" className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : product.rating;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-slate-500 mb-6 mt-2" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-slate-400">/</span>
              <span className="capitalize">{product.category}</span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-800 font-medium line-clamp-1">{product.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Left: Product Image */}
        <div className="lg:col-span-5 xl:col-span-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center justify-center h-[400px] sm:h-[500px] group overflow-hidden sticky top-6">
            <img
              src={product.image || 'https://via.placeholder.com/600'}
              alt={product.title}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
            {product.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className={i < Math.round(avgRating) ? 'text-amber-500' : 'text-slate-200'} />
              ))}
              <span className="ml-2 text-sm font-bold text-slate-700">{avgRating.toFixed(1)}</span>
            </div>
            <a href="#reviews" className="text-sm text-blue-500 hover:underline">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </a>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600">
              Sold by <span className="font-semibold text-slate-800">{product.sellerId?.name || 'Seller'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-orange-500 tracking-tight">
              ₹{product.price.toFixed(2)}
            </h2>
            <Badge variant={inStock ? 'success' : 'danger'} size="md" className="ml-2 py-1.5 px-3">
              {inStock ? (
                <span className="flex items-center gap-1.5"><FaCheckCircle/> In Stock</span>
              ) : (
                <span className="flex items-center gap-1.5"><FaExclamationCircle/> Out of Stock</span>
              )}
            </Badge>
          </div>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 border-t border-slate-100 pt-6">
            {product.description}
          </p>

          {/* Actions */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-auto">
            {inStock ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">Quantity</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                    <button 
                      onClick={decrementQty}
                      disabled={qty <= 1}
                      className="p-3 text-slate-500 hover:text-orange-500 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-slate-800 select-none">
                      {qty}
                    </span>
                    <button 
                      onClick={incrementQty}
                      disabled={qty >= product.stock || qty >= 10}
                      className="p-3 text-slate-500 hover:text-orange-500 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <span className="text-sm text-slate-500">
                    ({product.stock} available)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth 
                    className="shadow-lg shadow-orange-500/20 text-lg"
                    onClick={handleAddToCart}
                  >
                    <FaShoppingCart className="mr-2" /> Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    fullWidth 
                    className="bg-white"
                  >
                    <FaRegHeart className="mr-2" /> Wishlist
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" size="lg" fullWidth disabled>
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="border-t border-slate-200 pt-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          Customer Reviews 
          <Badge variant="neutral" size="md">{reviews.length}</Badge>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Write a Review */}
          <div className="lg:col-span-5">
            <Card padding="lg" className="bg-slate-50 border-none shadow-inner">
              <h4 className="text-xl font-bold text-slate-800 mb-6">Write a Review</h4>
              {user && user.role === 'customer' ? (
                <form onSubmit={submitReview} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Overall Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-3xl focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <FaStar className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review</label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                      rows="4"
                      placeholder="What did you like or dislike? What should other shoppers know?"
                      required
                    />
                  </div>
                  <Button type="submit" variant="primary" fullWidth size="lg">
                    Submit Review
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">Please log in to share your thoughts.</p>
                  <Link to="/login">
                    <Button variant="outline">Log In to Review</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-7">
            {reviews.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
                <FaStar className="mx-auto text-4xl text-slate-300 mb-3" />
                <p className="text-lg font-medium text-slate-700 mb-1">No reviews yet</p>
                <p>Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <ReviewCard 
                    key={review._id} 
                    review={{
                      reviewerName: review.userId?.name || 'Anonymous',
                      rating: review.rating,
                      reviewDate: new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                      reviewText: review.comment,
                      isVerifiedPurchase: true,
                      reviewTitle: review.rating >= 4 ? 'Great Product' : 'Good to know'
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
