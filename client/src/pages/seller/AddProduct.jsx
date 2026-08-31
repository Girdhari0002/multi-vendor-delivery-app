import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { FaCloudUploadAlt, FaImage, FaLink } from 'react-icons/fa';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'toys', label: 'Toys' },
  { value: 'other', label: 'Other' }
];

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', stock: '', imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageMode, setImageMode] = useState('file');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            category: data.category || '',
            stock: data.stock || '',
            imageUrl: data.image || '',
          });
          setPreview(data.image || '');
          if (data.image) setImageMode('url');
        } catch {
          toast.error('Failed to load product');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e) => {
    setFormData({ ...formData, imageUrl: e.target.value });
    setPreview(e.target.value);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);

      if (imageMode === 'file' && imageFile) {
        data.append('image', imageFile);
      } else if (imageMode === 'url' && formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
      } else if (id && preview) {
        data.append('imageUrl', preview);
      } else {
        toast.error('Please upload an image or provide an image URL');
        setLoading(false);
        return;
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (id) {
        await api.put(`/products/${id}`, data, config);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', data, config);
        toast.success('Product created successfully!');
      }
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center py-10"><span className="animate-pulse font-medium text-slate-500">Loading product data...</span></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Product Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-200'}`}
              placeholder="Describe your product..."
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-xs text-slate-500 text-right">{formData.description.length} characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              type="number"
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="0.00"
              icon={<span className="font-semibold">₹</span>}
            />
            
            <Input
              type="number"
              label="Stock Count"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
              placeholder="0"
            />

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES}
              error={errors.category}
              placeholder="Select Category"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-800 block">Product Image</label>
            
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  imageMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FaImage /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  imageMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FaLink /> Image URL
              </button>
            </div>

            {imageMode === 'file' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-orange-500 hover:bg-orange-50/50 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                  <FaCloudUploadAlt size={24} />
                </div>
                {imageFile ? (
                  <p className="text-sm font-medium text-slate-800">{imageFile.name}</p>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-800">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                )}
              </div>
            )}

            {imageMode === 'url' && (
              <Input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                icon={<FaLink />}
              />
            )}

            {preview && (
              <div className="mt-4 relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
                  onError={() => setPreview('')}
                />
                <button
                  type="button"
                  onClick={() => { setPreview(''); setImageFile(null); setFormData(p => ({...p, imageUrl: ''})) }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller/products')}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1 sm:flex-none"
            >
              {id ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddProduct;
