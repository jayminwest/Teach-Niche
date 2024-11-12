import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import CancelPage from "../layout";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock supabase client with all required auth methods
jest.mock("../../../utils/supabaseClient", () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
    },
  },
}));

// Mock Header and Footer components to avoid auth context issues
jest.mock("../../../components/Header", () => {
  return function MockHeader() {
    return <header role="banner">Header</header>;
  };
});

jest.mock("../../../components/Footer", () => {
  return function MockFooter() {
    return <footer role="contentinfo">Footer</footer>;
  };
});

// Test wrapper component
const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthProvider>,
  );
};

describe("CancelPage Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders main sections and is accessible", () => {
    renderWithProviders(<CancelPage />);

    // Test main heading
    expect(screen.getByRole("heading", { name: /Purchase Canceled/i }))
      .toBeInTheDocument();

    // Test landmark regions
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  test("displays correct cancel message", () => {
    renderWithProviders(<CancelPage />);
    expect(screen.getByText(/Your purchase was canceled/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You can try purchasing again from the marketplace/i),
    ).toBeInTheDocument();
  });

  test("return to marketplace button navigates correctly", () => {
    renderWithProviders(<CancelPage />);

    const marketplaceButton = screen.getByRole("button", {
      name: /Return to Marketplace/i,
    });
    expect(marketplaceButton).toBeInTheDocument();

    fireEvent.click(marketplaceButton);
    expect(mockNavigate).toHaveBeenCalledWith("/marketplace");
  });

  test("renders with proper layout structure", () => {
    renderWithProviders(<CancelPage />);

    // Check for card container using test-id
    const card = screen.getByTestId("cancel-card");
    expect(card).toHaveClass("card");
    expect(card).toHaveClass("bg-base-100");
  });

  test("button is properly styled", () => {
    renderWithProviders(<CancelPage />);

    const button = screen.getByRole("button", {
      name: /Return to Marketplace/i,
    });
    expect(button).toHaveClass("btn");
    expect(button).toHaveClass("btn-primary");
  });
});
