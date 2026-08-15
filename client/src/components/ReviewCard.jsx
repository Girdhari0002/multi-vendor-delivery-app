import { FaStar, FaThumbsUp, FaThumbsDown, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';

const ReviewCard = ({ review = {} }) => {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState({ yes: review.helpfulYes || 0, no: review.helpfulNo || 0 });
  const [userVote, setUserVote] = useState(null);

  // Default values if review is empty
  const {
    reviewerName = 'John Doe',
    reviewerAvatar = null,
    isVerifiedPurchase = true,
    rating = 4.2,
    reviewTitle = 'Great product, highly recommended!',
    reviewDate = new Date().toLocaleDateString(),
    reviewText = 'This is an amazing product with excellent quality. Delivery was fast and the customer service was very helpful. I would definitely recommend it to everyone looking for a reliable and affordable option.',
  } = review;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FaStar key={i} className="text-orange-400 text-sm" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative inline-block">
            <FaStar className="text-gray-300 text-sm" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <FaStar className="text-orange-400 text-sm" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FaStar key={i} className="text-gray-300 text-sm" />
        );
      }
    }
    return stars;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleHelpful = (type) => {
    if (userVote === type) {
      setUserVote(null);
      setHelpful({
        yes: type === 'yes' ? helpful.yes - 1 : helpful.yes,
        no: type === 'no' ? helpful.no - 1 : helpful.no,
      });
    } else {
      if (userVote) {
        if (userVote === 'yes') {
          setHelpful((prev) => ({ ...prev, yes: prev.yes - 1 }));
        } else {
          setHelpful((prev) => ({ ...prev, no: prev.no - 1 }));
        }
      }
      setUserVote(type);
      setHelpful({
        yes: type === 'yes' ? helpful.yes + 1 : helpful.yes,
        no: type === 'no' ? helpful.no + 1 : helpful.no,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition">
      {/* Top Row - Avatar, Name, Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm">
            {reviewerAvatar ? (
              <img src={reviewerAvatar} alt={reviewerName} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(reviewerName)
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">{reviewerName}</p>
          </div>
          {isVerifiedPurchase && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">
              <FaCheckCircle className="text-xs" /> Verified
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{reviewDate}</p>
      </div>

      {/* Star Rating Row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-0.5">{renderStars(rating)}</div>
        <span className="text-sm font-semibold text-gray-900">{rating}</span>
      </div>

      {/* Review Title */}
      <h4 className="font-bold text-base text-gray-900 mb-2">{reviewTitle}</h4>

      {/* Review Text with Expand Toggle */}
      <p
        className={`text-sm text-gray-700 leading-relaxed mb-3 ${expanded ? '' : 'line-clamp-3'}`}
      >
        {reviewText}
      </p>
      {reviewText.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 text-xs font-semibold mb-3 transition"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}

      {/* Helpful Section */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-600">Was this helpful?</span>
        <button
          onClick={() => handleHelpful('yes')}
          className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition ${
            userVote === 'yes'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaThumbsUp className="text-xs" /> Yes ({helpful.yes})
        </button>
        <button
          onClick={() => handleHelpful('no')}
          className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition ${
            userVote === 'no'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaThumbsDown className="text-xs" /> No ({helpful.no})
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
