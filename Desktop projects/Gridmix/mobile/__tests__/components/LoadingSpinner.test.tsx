import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Fetching data..." />);

    expect(screen.getByText('Fetching data...')).toBeTruthy();
  });

  it('renders activity indicator', () => {
    const { UNSAFE_getByType } = render(<LoadingSpinner />);
    const ActivityIndicator = require('react-native').ActivityIndicator;

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('handles undefined message gracefully', () => {
    render(<LoadingSpinner message={undefined} />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('displays correct loading message for different contexts', () => {
    const { rerender } = render(<LoadingSpinner message="Loading grid data..." />);
    expect(screen.getByText('Loading grid data...')).toBeTruthy();

    rerender(<LoadingSpinner message="Loading forecast..." />);
    expect(screen.getByText('Loading forecast...')).toBeTruthy();
  });
});
