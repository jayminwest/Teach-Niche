import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import EditLesson from '../[id]';

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

// Mock TextEditor component
jest.mock('../../../components/TextEditor', () => {
  return function MockTextEditor({ value, onChange }) {
    return (
      <textarea
        data-testid="mock-text-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

// Mock supabase client
jest.mock('../../../utils/supabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { 
          session: {
            user: { id: 'test-user-id' },
            access_token: 'test-token'
          }
        },
        error: null
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
        error: null
      })
    },
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
      })
    },
    from: (table) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockResolvedValue({ 
            data: [
              { id: 1, name: 'Category 1' },
              { id: 2, name: 'Category 2' }
            ], 
            error: null 
          })
        };
      }
      if (table === 'tutorials') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 1,
                  title: 'Test Lesson',
                  description: 'Test Description',
                  price: '10',
                  content: 'Test Content',
                  thumbnail_url: 'test-thumbnail.jpg',
                  vimeo_video_id: 'test-video-id'
                },
                error: null
              })
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          })
        };
      }
      if (table === 'tutorial_categories') {
        return {
          select: jest.fn().mockResolvedValue({ 
            data: [{ category_id: 1 }], 
            error: null 
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          }),
          insert: jest.fn().mockResolvedValue({ error: null })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null })
        })
      };
    }
  }
}));

// Mock Header, Footer, and other components
jest.mock('../../../components/Header', () => {
  return function MockHeader() {
    return <header role="banner">Header</header>;
  };
});

jest.mock('../../../components/Footer', () => {
  return function MockFooter() {
    return <footer role="contentinfo">Footer</footer>;
  };
});

jest.mock('../../../components/LessonRating', () => {
  return function MockLessonRating() {
    return <div data-testid="lesson-rating">Lesson Rating</div>;
  };
});

jest.mock('../../../components/LessonDiscussion', () => {
  return function MockLessonDiscussion() {
    return <div data-testid="lesson-discussion">Lesson Discussion</div>;
  };
});

// Mock AlertMessage component
jest.mock('../../../components/AlertMessage', () => {
  return function MockAlertMessage({ error, success }) {
    return (
      <div>
        {error && <div role="alert">{error}</div>}
        {success && <div role="status">{success}</div>}
      </div>
    );
  };
});

// Test wrapper component
const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('EditLesson Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders lesson data correctly', async () => {
    renderWithProviders(<EditLesson />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Lesson')).toBeInTheDocument();
    });

    // Then check other fields
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    
    // Check price select value
    const priceSelect = screen.getByLabelText(/Price/i);
    expect(priceSelect.value).toBe('10');
    
    expect(screen.getByTestId('mock-text-editor')).toHaveValue('Test Content');
  });

  test('handles form updates correctly', async () => {
    renderWithProviders(<EditLesson />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Lesson')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Lesson' } });
    expect(titleInput.value).toBe('Updated Lesson');
  });

  test('handles tab switching', async () => {
    renderWithProviders(<EditLesson />);
    
    // Wait for initial render and use more specific selector
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
    });

    // Click Reviews tab
    fireEvent.click(screen.getByRole('tab', { name: /reviews/i }));
    expect(screen.getByTestId('lesson-rating')).toBeInTheDocument();

    // Click Discussion tab
    fireEvent.click(screen.getByRole('tab', { name: /discussion/i }));
    expect(screen.getByTestId('lesson-discussion')).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    renderWithProviders(<EditLesson />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Lesson')).toBeInTheDocument();
    });

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Lesson updated successfully!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    }, { timeout: 3000 });
  });

  test('handles delete confirmation', async () => {
    window.confirm = jest.fn(() => true);
    renderWithProviders(<EditLesson />);
    
    // Wait for delete button to be available
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete lesson/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete lesson/i }));
    expect(window.confirm).toHaveBeenCalled();
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Lesson deleted successfully!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Run the setTimeout immediately
    jest.runAllTimers();

    // Now check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('cancels delete when not confirmed', async () => {
    window.confirm = jest.fn(() => false);
    renderWithProviders(<EditLesson />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete lesson/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete lesson/i }));
    expect(window.confirm).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
}); 