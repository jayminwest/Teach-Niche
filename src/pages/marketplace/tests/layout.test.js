import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MarketplaceLayout from '../layout';

// Mock child components
jest.mock('../components/LessonsGrid', () => {
  return function MockLessonsGrid({ sortOption }) {
    return (
      <div data-testid="lessons-grid" data-sort={sortOption}>
        Mock Lessons Grid
      </div>
    );
  };
});

jest.mock('../../../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Mock Header</div>;
  };
});

jest.mock('../../../components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Mock Footer</div>;
  };
});

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('MarketplaceLayout Component', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.dispatchEvent(new Event('resize'));
  });

  test('renders all components correctly', () => {
    renderWithRouter(<MarketplaceLayout />);
    
    expect(screen.getByText('Lesson Marketplace')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('lessons-grid')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('sort dropdown changes update LessonsGrid', () => {
    renderWithRouter(<MarketplaceLayout />);
    
    const sortSelect = screen.getByRole('combobox');
    
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });
    expect(screen.getByTestId('lessons-grid')).toHaveAttribute('data-sort', 'price_asc');
    
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });
    expect(screen.getByTestId('lessons-grid')).toHaveAttribute('data-sort', 'price_desc');
  });

  test('adapts layout for mobile viewport', () => {
    window.innerWidth = 600;
    window.dispatchEvent(new Event('resize'));
    
    renderWithRouter(<MarketplaceLayout />);
    
    const title = screen.getByText('Lesson Marketplace');
    expect(title).toHaveClass('text-2xl');
  });

  test('adapts layout for desktop viewport', () => {
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
    
    renderWithRouter(<MarketplaceLayout />);
    
    const title = screen.getByText('Lesson Marketplace');
    expect(title).toHaveClass('text-3xl');
  });
}); 