import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AuthCallback from '../callback';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAuthCallbackNavigation with handlers invoking mockNavigate
jest.mock('../../../hooks/useAuthCallbackNavigation', () => ({
  useAuthCallbackNavigation: () => ({
    handleNavigateToProfile: () => mockNavigate('/profile'),
    handleNavigateToSignIn: () => mockNavigate('/sign-in'),
  }),
}));

// Mock supabase client with proper structure
jest.mock('../../../utils/supabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock AlertMessage component
jest.mock('../../../components/AlertMessage', () => {
  const AlertMessage = ({ error }) => <div data-testid="alert-message">{error}</div>;
  return AlertMessage;
});

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('AuthCallback Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows loading state and navigates to profile on successful authentication', async () => {
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: '123' }
        }
      },
      error: null
    });

    renderWithProviders(<AuthCallback />);

    // Check loading states in sequence
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Verifying session...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('shows error and navigates to sign-in on authentication failure', async () => {
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockRejectedValue(new Error('Auth failed'));

    renderWithProviders(<AuthCallback />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-message')).toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
  });

  test('handles invalid session data', async () => {
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    renderWithProviders(<AuthCallback />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-message')).toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
  });

  test('handles session error', async () => {
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockResolvedValue({
      data: null,
      error: new Error('Session error')
    });

    renderWithProviders(<AuthCallback />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-message')).toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
  });

  test('return to sign in button works', async () => {
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockRejectedValue(new Error('Auth failed'));

    renderWithProviders(<AuthCallback />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-message')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /return to sign in/i });
    await fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
  });

  test('buttons have accessible names', async () => {
    const supabase = require('../../../utils/supabaseClient').default;
    supabase.auth.getSession.mockRejectedValue(new Error('Auth failed'));

    renderWithProviders(<AuthCallback />);

    await waitFor(() => {
      const returnButton = screen.getByRole('button', { name: /return to sign in/i });
      expect(returnButton).toHaveAccessibleName('Return to Sign In');
    });
  });
}); 