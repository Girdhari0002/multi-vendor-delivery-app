import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import Product from '../models/Product.js';
import { createUserAndToken } from './helpers.js';

const makeProducts = async (sellerId, count) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      title: `Product ${i}`,
      description: 'A test product',
      price: 100 + i,
      image: 'https://example.com/image.jpg',
      category: 'electronics',
      stock: 10,
      sellerId,
    });
  }
  return Product.insertMany(products);
};

describe('GET /api/products', () => {
  it('paginates results using the default page size', async () => {
    const { user: seller } = await createUserAndToken({ role: 'seller' });
    await makeProducts(seller._id, 15);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(12); // default limit
    expect(res.body.total).toBe(15);
    expect(res.body.pages).toBe(2);
  });

  it('filters by price range', async () => {
    const { user: seller } = await createUserAndToken({ role: 'seller' });
    await makeProducts(seller._id, 5); // prices 100-104

    const res = await request(app).get('/api/products').query({ minPrice: 102, maxPrice: 103 });

    expect(res.status).toBe(200);
    expect(res.body.products.every((p) => p.price >= 102 && p.price <= 103)).toBe(true);
  });

  it('rejects an invalid product id', async () => {
    const res = await request(app).get('/api/products/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});
