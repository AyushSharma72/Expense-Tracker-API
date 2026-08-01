const mongoose = require('mongoose');
const request = require('supertest');
const connectDB = require('../src/config/db');
const { Expense } = require('../src/models/expense.model');
const app = require('../src/app');

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Expense.deleteMany({});
});

afterAll(async () => {
  await Expense.deleteMany({});
  await mongoose.connection.close();
});

describe('Smart Expense Tracker API', () => {
  describe('POST /api/expenses', () => {
    it('creates an expense with a generated id', async () => {
      const response = await request(app).post('/api/expenses').send({
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
        date: '2026-07-31',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
        date: '2026-07-31',
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('rejects invalid payloads', async () => {
      const response = await request(app).post('/api/expenses').send({
        title: '',
        amount: -5,
        category: 'Food',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      await request(app).post('/api/expenses').send({
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
        date: '2026-07-31',
      });
      await request(app).post('/api/expenses').send({
        title: 'Uber',
        amount: 20,
        category: 'Transport',
        date: '2026-07-30',
      });
    });

    it('returns all expenses', async () => {
      const response = await request(app).get('/api/expenses');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('filters expenses by category (case-insensitive)', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .query({ category: 'food' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].category).toBe('Food');
    });
  });

  describe('GET /api/expenses/totals', () => {
    beforeEach(async () => {
      await request(app).post('/api/expenses').send({
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
        date: '2026-07-31',
      });
      await request(app).post('/api/expenses').send({
        title: 'Dinner',
        amount: 30,
        category: 'Food',
        date: '2026-07-31',
      });
      await request(app).post('/api/expenses').send({
        title: 'Uber',
        amount: 20,
        category: 'Transport',
        date: '2026-07-30',
      });
    });

    it('returns overall total', async () => {
      const response = await request(app).get('/api/expenses/totals');

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(62.5);
      expect(response.body.data.count).toBe(3);
      expect(response.body.data.category).toBeNull();
    });

    it('returns total for a category', async () => {
      const response = await request(app)
        .get('/api/expenses/totals')
        .query({ category: 'Food' });

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(42.5);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.category).toBe('Food');
    });
  });

  describe('GET /api/expenses/totals/by-category', () => {
    it('returns totals grouped by category', async () => {
      await request(app).post('/api/expenses').send({
        title: 'Lunch',
        amount: 10,
        category: 'Food',
        date: '2026-07-31',
      });
      await request(app).post('/api/expenses').send({
        title: 'Bus',
        amount: 5,
        category: 'Transport',
        date: '2026-07-31',
      });

      const response = await request(app).get(
        '/api/expenses/totals/by-category'
      );

      expect(response.status).toBe(200);
      expect(response.body.data.overallTotal).toBe(15);
      expect(response.body.data.overallCount).toBe(2);
      expect(response.body.data.byCategory.Food).toEqual({
        total: 10,
        count: 1,
      });
      expect(response.body.data.byCategory.Transport).toEqual({
        total: 5,
        count: 1,
      });
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('deletes an existing expense', async () => {
      const created = await request(app).post('/api/expenses').send({
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
        date: '2026-07-31',
      });

      const id = created.body.data.id;
      const response = await request(app).delete(`/api/expenses/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const list = await request(app).get('/api/expenses');
      expect(list.body.count).toBe(0);
    });

    it('returns 404 for a missing expense', async () => {
      const response = await request(app).delete(
        '/api/expenses/123e4567-e89b-12d3-a456-426614174000'
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).delete('/api/expenses/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('concurrency', () => {
    it('creates distinct expenses under concurrent requests', async () => {
      const payloads = Array.from({ length: 20 }, (_, index) => ({
        title: `Expense-${index}`,
        amount: index + 1,
        category: index % 2 === 0 ? 'Food' : 'Transport',
        date: `2026-07-${String((index % 28) + 1).padStart(2, '0')}`,
      }));

      const responses = await Promise.all(
        payloads.map((payload) =>
          request(app).post('/api/expenses').send(payload)
        )
      );

      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject(payloads[index]);
      });

      const ids = responses.map((response) => response.body.data.id);
      expect(new Set(ids).size).toBe(payloads.length);

      const list = await request(app).get('/api/expenses');
      expect(list.status).toBe(200);
      expect(list.body.count).toBe(payloads.length);

      const storedByTitle = new Map(
        list.body.data.map((expense) => [expense.title, expense])
      );

      payloads.forEach((payload) => {
        expect(storedByTitle.get(payload.title)).toMatchObject(payload);
      });
    });

    it('keeps totals correct after concurrent creates', async () => {
      const payloads = Array.from({ length: 15 }, (_, index) => ({
        title: `Total-${index}`,
        amount: 10,
        category: 'Food',
        date: '2026-07-31',
      }));

      const responses = await Promise.all(
        payloads.map((payload) =>
          request(app).post('/api/expenses').send(payload)
        )
      );

      expect(responses.every((response) => response.status === 201)).toBe(true);

      const totals = await request(app).get('/api/expenses/totals');
      expect(totals.status).toBe(200);
      expect(totals.body.data.count).toBe(15);
      expect(totals.body.data.total).toBe(150);
    });

    it('handles concurrent deletes without losing unrelated expenses', async () => {
      const created = await Promise.all(
        Array.from({ length: 10 }, (_, index) =>
          request(app)
            .post('/api/expenses')
            .send({
              title: `Delete-${index}`,
              amount: index + 1,
              category: 'Misc',
              date: '2026-07-31',
            })
        )
      );

      const ids = created.map((response) => response.body.data.id);
      const toDelete = ids.slice(0, 5);
      const toKeep = ids.slice(5);

      const deleteResponses = await Promise.all(
        toDelete.map((id) => request(app).delete(`/api/expenses/${id}`))
      );

      expect(
        deleteResponses.every((response) => response.status === 200)
      ).toBe(true);

      const list = await request(app).get('/api/expenses');
      expect(list.body.count).toBe(5);

      const remainingIds = list.body.data.map((expense) => expense.id).sort();
      expect(remainingIds).toEqual([...toKeep].sort());
    });
  });
});
