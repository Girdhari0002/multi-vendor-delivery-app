import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const CATEGORIES = ['electronics', 'clothing', 'food', 'books', 'other'];

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', stock: '', imageUrl: ''
  });
  const [imageFile, setImageFile]     = useState(null);   // actual File object
  const [imageMode, setImageMode]     = useState('file'); // 'file' | 'url'
  const [preview, setPreview]         = useState('');
  const [loading, setLoading]         = useState(false);

  // When editing, load existing product data
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setFormData({
            title:       data.title,
            description: data.description,
            price:       data.price,
            category:    data.category,
            stock:       data.stock,
            imageUrl:    data.image || '',
          });
          setPreview(data.image || '');
          if (data.image) setImageMode('url'); // show URL section when editing
        } catch {
          toast.error('Failed to load product');
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle file picker
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Handle URL input preview
  const handleUrlChange = (e) => {
    setFormData({ ...formData, imageUrl: e.target.value });
    setPreview(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Always send multipart/form-data so multer can parse it
      const data = new FormData();
      data.append('title',       formData.title);
      data.append('description', formData.description);
      data.append('price',       formData.price);
      data.append('category',    formData.category);
      data.append('stock',       formData.stock);

      if (imageMode === 'file' && imageFile) {
        data.append('image', imageFile); // field name matches upload.single('image')
      } else if (imageMode === 'url' && formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
      } else if (id && preview) {
        // editing with no new image — pass existing URL so backend keeps it
        data.append('imageUrl', preview);
      } else {
        toast.error('Please upload an image or provide an image URL');
        setLoading(false);
        return;
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await api.put(`/products/${id}`, data, config);
        toast.success('Product updated!');
      } else {
        await api.post('/products', data, config);
        toast.success('Product created!');
      }
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Title</label>
          <input
            type="text" name="title" required value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description" required value={formData.description}
            onChange={handleChange} rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
            <input
              type="number" name="price" required value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Count</label>
            <input
              type="number" name="stock" required value={formData.stock}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category" required value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* ── Image Section ── */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Product Image</p>

          {/* Mode tabs */}
          <div className="flex rounded-md overflow-hidden border border-gray-300 w-fit">
            <button
              type="button"
              onClick={() => setImageMode('file')}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                imageMode === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`px-4 py-1.5 text-sm font-medium border-l border-gray-300 transition-colors ${
                imageMode === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔗 Image URL
            </button>
          </div>

          {/* File Upload */}
          {imageMode === 'file' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {imageFile ? (
                <p className="text-sm text-blue-700 font-medium">✅ {imageFile.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Click to browse or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5 MB</p>
                </>
              )}
            </div>
          )}

          {/* Image URL */}
          {imageMode === 'url' && (
            <div>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                onError={() => setPreview('')}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-white font-bold hover:bg-blue-700 focus:outline-none disabled:opacity-60"
          >
            {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
