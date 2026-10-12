// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  it('renders its label and value', () => {
    render(<StatCard label="Jobs" value={7} />);
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows the hint when provided', () => {
    render(<StatCard label="Revenue" value="₦5,000" hint="+12% this month" />);
    expect(screen.getByText('+12% this month')).toBeInTheDocument();
  });
});
