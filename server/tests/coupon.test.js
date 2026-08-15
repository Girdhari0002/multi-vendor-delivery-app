import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import Coupon from '../models/Coupon.js';
import { createUserAndToken } from './helpers.js';

describe('Coupons', () => {
  it('admin can create a coupon, and a customer can validate it', async () => {
    const { token: adminToken } = await createUserAndToken({ role: 'admin' });
    const { token: customerToken } = await createUserAndToken({ role: 'customer' });

    const createRes = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'SAVE10', discountType: 'percent', discountValue: 10, minOrderValue: 100 });

    expect(createRes.status).toBe(201);
    expect(createRes.body.code).toBe('SAVE10');

    const validateRes = await request(app)
      .post('/api/coupons/validate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'save10', orderTotal: 200 });

    expect(validateRes.status).toBe(200);
    expect(validateRes.body.discount).toBe(20);
  });

  it('rejects a coupon below the minimum order value', async () => {
    const { token: customerToken } = await createUserAndToken({ role: 'customer' });
    await Coupon.create({ code: 'BIGORDER', discountType: 'flat', discountValue: 50, minOrderValue: 500 });

    const res = await request(app)
      .post('/api/coupons/validate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'BIGORDER', orderTotal: 100 });

    expect(res.status).toBe(400);
  });

  it('non-admin cannot create a coupon', async () => {
    const { token: customerToken } = await createUserAndToken({ role: 'customer' });

    const res = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'HACK', discountType: 'flat', discountValue: 1000 });

    expect(res.status).toBe(403);
  });
});
