import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LessonsGrid from '../../components/LessonsGrid';

// Mock data
const mockLessons = [
  {
    id: '1',
    title: 'Test Lesson 1',
    price: 10,
    creator_id: 'creator1',
    profiles: { full_name: 'Test Creator 1' },
    description: 'Test Description 1',
    thumbnail_url: 'test1.jpg'
  },
  {
    id: '2',
    title: 'Test Lesson 2',
    price: 20,
    creator_id: 'creator2',
    profiles: { full_name: 'Test Creator 2' },
    description: 'Test Description 2',
    thumbnail_url: 'test2.jpg'
  }
];

// Mock Supabase client with better structure
const mockSupabase = {
  from: jest.fn()
};

// Default mock implementation
mockSupabase.from.mockReturnValue({
  select: jest.fn().mockReturnValue({
    limit: jest.fn().mockResolvedValue({ data: mockLessons, error: null })
  })
});

jest.mock('../../../../utils/supabaseClient', () => ({
  __esModule: true,
  default: mockSupabase
}));

// Mock Auth Context
jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1' }
  })
}));

// Mock LessonCard component
jest.mock('../../components/LessonCard', () => {
  return function MockLessonCard({ title, price, creatorName }) {
    return (
      <div data-testid="lesson-card">
        <h2>{title}</h2>
        <p data-testid="lesson-price">{price}</p>
        <p data-testid="lesson-creator">{creatorName}</p>
      </div>
    );
  };
});

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('LessonsGrid Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Force loading state by making the mock return a never-resolving promise
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue(new Promise(() => {})) // Never resolves
      })
    });

    renderWithRouter(<LessonsGrid />);

    // Loading state should be visible immediately
    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveAttribute('aria-label', 'Loading lessons');
    expect(loadingSpinner).toHaveAttribute('aria-busy', 'true');
  });

  test('renders lessons after loading', async () => {
    // Setup mock to resolve with data
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: mockLessons, error: null })
      })
    });

    renderWithRouter(<LessonsGrid />);

    // Wait for loading to finish and cards to appear
    await waitFor(() => {
      expect(screen.getAllByTestId('lesson-card')).toHaveLength(2);
    }, { timeout: 3000 });

    // Verify card content
    expect(screen.getByText('Test Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('Test Lesson 2')).toBeInTheDocument();
  });

  test('shows message when no purchased lessons available', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    });

    renderWithRouter(<LessonsGrid showPurchasedOnly={true} />);

    await waitFor(() => {
      expect(screen.getByText("You haven't purchased any lessons yet.")).toBeInTheDocument();
    });
  });

  test('handles Supabase error gracefully', async () => {
    const error = new Error('Supabase error');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockRejectedValue(error)
      })
    });

    renderWithRouter(<LessonsGrid />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching lessons or purchases:',
        error.message
      );
    });

    consoleSpy.mockRestore();
  });

  test('respects the limit prop', async () => {
    const limitedMockLessons = mockLessons.slice(0, 1);
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: limitedMockLessons, error: null })
      })
    });

    renderWithRouter(<LessonsGrid limit={1} />);

    // Wait for loading to finish and card to appear
    await waitFor(() => {
      const cards = screen.getAllByTestId('lesson-card');
      expect(cards).toHaveLength(1);
      expect(screen.getByText('Test Lesson 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Lesson 2')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 