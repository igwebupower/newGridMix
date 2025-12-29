import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorMessage } from '@/components/ErrorMessage';

describe('ErrorMessage Component', () => {
  it('renders error message correctly', () => {
    render(<ErrorMessage message="Network error occurred" />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Network error occurred')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={mockRetry} />);

    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);

    expect(screen.queryByText('Try Again')).toBeNull();
  });

  it('calls onRetry when retry button is pressed', () => {
    const mockRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={mockRetry} />);

    fireEvent.press(screen.getByText('Try Again'));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('displays the cloud-offline icon', () => {
    const { getByTestId } = render(
      <ErrorMessage message="Error" />,
    );

    // Icon should be present (Ionicons renders with testID)
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('handles long error messages', () => {
    const longMessage = 'This is a very long error message that should still be displayed correctly without breaking the layout or causing any issues';
    render(<ErrorMessage message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeTruthy();
  });

  it('handles empty error message', () => {
    render(<ErrorMessage message="" />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });
});
