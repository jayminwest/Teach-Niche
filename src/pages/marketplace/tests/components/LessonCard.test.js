import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LessonCard from '../../components/LessonCard';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Auth Context
const mockUser = { id: 'user1' };
const mockSession = { access_token: 'test-token' };
jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    session: mockSession
  })
}));

// Mock Supabase client
jest.mock('../../../../utils/supabaseClient', () => ({
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ error: null })
  }))
}));

// Mock fetch for checkout session
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ sessionUrl: 'https://checkout.stripe.com/test' })
  })
);

const defaultProps = {
  id: '1',
  title: 'Test Lesson',
  creator_id: 'creator1',
  creatorName: 'Test Creator',
  price: 10,
  description: 'Test Description',
  thumbnail_url: 'test-image.jpg',
  isPurchased: false,
  isWelcomeLesson: false,
};

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('LessonCard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch.mockClear();
  });

  test('renders lesson card with correct information', () => {
    renderWithRouter(<LessonCard {...defaultProps} />);
    
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(`Creator: ${defaultProps.creatorName}`)).toBeInTheDocument();
    expect(screen.getByText(`$${defaultProps.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
  });

  test('shows edit button for creator', () => {
    renderWithRouter(
      <LessonCard {...defaultProps} creator_id={mockUser.id} />
    );
    
    const editButton = screen.getByRole('button', { name: /edit lesson/i });
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/edit-lesson/${defaultProps.id}`);
  });

  test('shows access button for purchased lessons', () => {
    renderWithRouter(
      <LessonCard {...defaultProps} isPurchased={true} />
    );
    
    const accessButton = screen.getByRole('button', { name: /access lesson/i });
    expect(accessButton).toBeInTheDocument();
    
    fireEvent.click(accessButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/lesson/${defaultProps.id}`);
  });

  test('shows purchase button for unpurchased lessons', async () => {
    renderWithRouter(<LessonCard {...defaultProps} />);
    
    const purchaseButton = screen.getByRole('button', { name: /purchase lesson/i });
    expect(purchaseButton).toBeInTheDocument();
    
    fireEvent.click(purchaseButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('handles image load error', () => {
    renderWithRouter(<LessonCard {...defaultProps} thumbnail_url="invalid-url" />);
    
    const image = screen.getByAltText(`Lesson: ${defaultProps.title}`);
    fireEvent.error(image);
    
    expect(image.src).toContain('placeholder');
  });

  test('handles free lesson purchase', async () => {
    const freeLessonProps = { ...defaultProps, price: 0 };
    renderWithRouter(<LessonCard {...freeLessonProps} />);
    
    const purchaseButton = screen.getByRole('button', { name: /purchase lesson/i });
    fireEvent.click(purchaseButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/lesson/${freeLessonProps.id}`);
    });
  });

  test('redirects to sign in for unauthenticated users', async () => {
    jest.spyOn(require('../../../../context/AuthContext'), 'useAuth')
      .mockImplementationOnce(() => ({
        user: null,
        session: null
      }));

    renderWithRouter(<LessonCard {...defaultProps} />);
    
    const purchaseButton = screen.getByRole('button', { name: /purchase lesson/i });
    fireEvent.click(purchaseButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
  });
}); 