import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AboutUs from '../layout';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

// Test wrapper component
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('AboutUs Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.spyOn(require('../../../context/AuthContext'), 'useAuth')
      .mockReturnValue({ user: null });
  });

  test('renders main sections and is accessible', () => {
    renderWithProviders(<AboutUs />);
    
    // Test main heading hierarchy
    const headings = screen.getAllByRole('heading');
    expect(headings[0]).toHaveTextContent('About Teach Niche');
    
    // Test landmark regions
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('expandable sections are keyboard accessible', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AboutUs />);
    
    // Get the Values summary element directly
    const valuesSummary = screen.getByText('Values');
    
    await user.click(valuesSummary);
    expect(screen.getByText('Community Collaboration')).toBeInTheDocument();
  });

  test('navigation buttons work with keyboard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AboutUs />);
    
    const teacherButton = screen.getByTestId('teacher-button');
    
    await user.click(teacherButton);
    expect(mockNavigate).toHaveBeenCalledWith('/sign-up');
  });

  test('renders main heading and mission statement', () => {
    renderWithProviders(<AboutUs />);
    expect(screen.getByText('About Teach Niche')).toBeInTheDocument();
    expect(screen.getByText(/Built to serve the kendama community/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mission/i })).toBeInTheDocument();
  });

  test('renders all value cards when Values section is expanded', () => {
    renderWithProviders(<AboutUs />);
    const valuesSection = screen.getByText('Values');
    fireEvent.click(valuesSection);

    expect(screen.getByText('Community Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Growth and Learning')).toBeInTheDocument();
    expect(screen.getByText('Integrity and Fairness')).toBeInTheDocument();
    expect(screen.getByText('Sustainability')).toBeInTheDocument();
  });

  test('navigates to sign-up when "Become a Teacher" is clicked without user', () => {
    renderWithProviders(<AboutUs />);
    const teacherButton = screen.getByTestId('teacher-button');
    fireEvent.click(teacherButton);
    expect(mockNavigate).toHaveBeenCalledWith('/sign-up');
  });

  test('navigates to profile when "Become a Teacher" is clicked with user', () => {
    jest.spyOn(require('../../../context/AuthContext'), 'useAuth')
      .mockReturnValue({ user: { id: '1', name: 'Test User' } });

    renderWithProviders(<AboutUs />);
    const teacherButton = screen.getByTestId('teacher-button');
    fireEvent.click(teacherButton);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('navigates to marketplace when "View Lessons" is clicked', () => {
    renderWithProviders(<AboutUs />);
    const lessonsButton = screen.getByTestId('marketplace-button');
    fireEvent.click(lessonsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/marketplace');
  });

  test('renders all expandable sections', () => {
    renderWithProviders(<AboutUs />);
    const sections = [
      'Values',
      'Why Teach Niche?',
      'Commission Structure',
      'Open Source Philosophy',
      'Built to Grow with the Community'
    ];

    sections.forEach(section => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });

  test('GitHub repository link is present and correctly configured', () => {
    renderWithProviders(<AboutUs />);
    const githubLink = screen.getByText('View GitHub Repository');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/jayminwest/Teach-Niche');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders founder information', () => {
    renderWithProviders(<AboutUs />);
    expect(screen.getByText(/Jaymin West/)).toBeInTheDocument();
    expect(screen.getByText(/Story/)).toBeInTheDocument();
  });

  test('details sections expand and collapse correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AboutUs />);
    
    // Test each section individually
    const sections = [
      'Values',
      'Why Teach Niche?',
      'Commission Structure',
      'Open Source Philosophy',
      'Built to Grow with the Community'
    ];
    
    for (const sectionTitle of sections) {
      const summary = screen.getByText(sectionTitle);
      const details = summary.closest('details');
      
      // Test expanding
      await user.click(summary);
      expect(details).toHaveAttribute('open');
      
      // Test collapsing
      await user.click(summary);
      expect(details).not.toHaveAttribute('open');
    }
  });

  test('buttons have accessible names', () => {
    renderWithProviders(<AboutUs />);
    const teacherButton = screen.getByTestId('teacher-button');
    const marketplaceButton = screen.getByTestId('marketplace-button');

    expect(teacherButton).toHaveAccessibleName('Become a Teacher');
    expect(marketplaceButton).toHaveAccessibleName('View Lessons');
  });
}); 