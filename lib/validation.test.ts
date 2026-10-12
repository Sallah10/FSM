import { describe, expect, it } from 'vitest';
import {
  createCustomerSchema,
  createJobSchema,
  signupSchema,
  updateJobSchema,
} from '@/lib/validation';

describe('validation schemas', () => {
  it('accepts a valid job', () => {
    expect(
      createJobSchema.safeParse({ title: 'AC Repair', customerId: 'cus_1' }).success,
    ).toBe(true);
  });

  it('rejects a too-short job title', () => {
    expect(
      createJobSchema.safeParse({ title: 'x', customerId: 'cus_1' }).success,
    ).toBe(false);
  });

  it('rejects an unknown job status', () => {
    expect(updateJobSchema.safeParse({ status: 'done' }).success).toBe(false);
    expect(updateJobSchema.safeParse({ status: 'completed' }).success).toBe(true);
  });

  it('rejects a malformed customer email', () => {
    expect(
      createCustomerSchema.safeParse({ name: 'Ada', email: 'nope' }).success,
    ).toBe(false);
  });

  it('enforces an 8 character minimum password', () => {
    expect(
      signupSchema.safeParse({ name: 'Ada', email: 'ada@example.com', password: 'short' }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({ name: 'Ada', email: 'ada@example.com', password: 'longenough' }).success,
    ).toBe(true);
  });
});
