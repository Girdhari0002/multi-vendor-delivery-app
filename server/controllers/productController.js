import Product from '../models/Product.js';
import { uploadImage } from '../services/imagekit.js';


// GET /api/products (with search, filter, sort and pagination)
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, page, limit, sort } = req.query;

    let query = {};
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('sellerId', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products (Seller only)
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, imageUrl } = req.body;
    const file = req.file;

    let finalImageUrl = '';

    if (file) {
      // Direct file upload → send to ImageKit
      const uploadedImage = await uploadImage(file);
      if (!uploadedImage || !uploadedImage.url) {
        return res.status(500).json({ message: 'ImageKit upload failed' });
      }
      finalImageUrl = uploadedImage.url;
    } else if (imageUrl) {
      // Seller pasted an external / hosted image URL
      finalImageUrl = imageUrl;
    } else {
      return res.status(400).json({ message: 'Please upload an image file or provide an image URL' });
    }

    const product = new Product({
      title,
      description,
      price,
      image: finalImageUrl,
      category,
      stock,
      sellerId: req.user._id
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id (Seller only, own product)
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, imageUrl } = req.body;
    const file = req.file;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if seller owns it or if admin
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this product' });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    // Update image only if a new file or URL is provided
    if (file) {
      const uploadedImage = await uploadImage(file);
      if (!uploadedImage || !uploadedImage.url) {
        return res.status(500).json({ message: 'ImageKit upload failed' });
      }
      product.image = uploadedImage.url;
    } else if (imageUrl) {
      product.image = imageUrl;
    }
    // else keep existing image

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id (Seller or Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
