import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import User from '../models/User.js';
import { createUserAndToken } from './helpers.js';

describe('DELETE /api/admin/users/:id', () => {
  it('admin can delete a customer account', async () => {
    const { token: adminToken } = await createUserAndToken({ role: 'admin' });
    const { user: customer } = await createUserAndToken({ role: 'customer' });

    const res = await request(app)
      .delete(`/api/admin/users/${customer._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const found = await User.findById(customer._id);
    expect(found).toBeNull();
  });

  it('refuses to delete an admin account', async () => {
    const { token: adminToken } = await createUserAndToken({ role: 'admin' });
    const { user: otherAdmin } = await createUserAndToken({ role: 'admin' });

    const res = await request(app)
      .delete(`/api/admin/users/${otherAdmin._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it('refuses to let an admin delete themselves', async () => {
    const { token: adminToken, user: admin } = await createUserAndToken({ role: 'admin' });

    const res = await request(app)
      .delete(`/api/admin/users/${admin._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it('non-admin cannot delete users', async () => {
    const { token: customerToken } = await createUserAndToken({ role: 'customer' });
    const { user: target } = await createUserAndToken({ role: 'customer' });

    const res = await request(app)
      .delete(`/api/admin/users/${target._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });
});
