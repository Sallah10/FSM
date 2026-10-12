// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardStatCard from '@/components/DashboardStatCard';

describe('DashboardStatCard', () => {
  it('renders its title and value', () => {
    render(<DashboardStatCard title="Jobs" value="7" />);
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows growth text when provided', () => {
    render(<DashboardStatCard title="Revenue" value="₦5,000" growth="+12%" />);
    expect(screen.getByText(/this month/i)).toBeInTheDocument();
  });
});
