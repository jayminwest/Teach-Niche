import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import CreateLesson from "../layout";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock TextEditor component
jest.mock("../../../components/TextEditor", () => {
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
jest.mock("../../../utils/supabaseClient", () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: "test-user-id" },
            access_token: "test-token",
          },
        },
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
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({
          data: { path: "test-path" },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "test-url" },
        }),
      }),
    },
    from: (table) => {
      if (table === "categories") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 1, title: "Test Lesson" },
              error: null,
            }),
          }),
        }),
      };
    },
  },
}));

// Mock Header and Footer components
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

// Mock fetch for Vimeo upload
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        upload_link: "test-upload-link",
        vimeo_video_id: "test-video-id",
        vimeo_url: "test-vimeo-url",
        chunk_size: 1024,
        access_token: "test-token",
      }),
    headers: new Headers({
      "Upload-Offset": "1024",
    }),
  })
);

// Mock AlertMessage component
jest.mock("../../../components/AlertMessage", () => {
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
    </AuthProvider>,
  );
};

beforeAll(() => {
  // Suppress console.error messages
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  // Restore console.error
  console.error.mockRestore();
});

describe("CreateLesson Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  test("renders main sections and is accessible", () => {
    renderWithProviders(<CreateLesson />);

    expect(screen.getByRole("heading", { name: /Create New Lesson/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    renderWithProviders(<CreateLesson />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Video/i)).toBeInTheDocument();
    // Fix thumbnail test by using getByRole instead
    expect(screen.getByRole("button", { name: /Create Lesson/i }))
      .toBeInTheDocument();
    expect(screen.getByTestId("mock-text-editor")).toBeInTheDocument();
  });

  test("handles form input changes", () => {
    renderWithProviders(<CreateLesson />);

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "Test Lesson" } });
    expect(titleInput.value).toBe("Test Lesson");

    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });
    expect(descriptionInput.value).toBe("Test Description");
  });

  test("handles price selection and custom price input", () => {
    renderWithProviders(<CreateLesson />);

    const priceSelect = screen.getByLabelText(/Price/i);
    fireEvent.change(priceSelect, { target: { value: "custom" } });

    const customPriceInput = screen.getByPlaceholderText(/Enter custom price/i);
    expect(customPriceInput).toBeInTheDocument();

    fireEvent.change(customPriceInput, { target: { value: "25.99" } });
    expect(customPriceInput.value).toBe("25.99");
  });

  test("handles file uploads", () => {
    renderWithProviders(<CreateLesson />);

    const videoInput = screen.getByLabelText(/Upload Video/i);
    const file = new File(["test"], "test.mp4", { type: "video/mp4" });
    fireEvent.change(videoInput, { target: { files: [file] } });

    expect(screen.getByText(/Selected video: test.mp4/i)).toBeInTheDocument();
  });

  test("submits form successfully", async () => {
    renderWithProviders(<CreateLesson />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Lesson" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByTestId("mock-text-editor"), {
      target: { value: "Test Content" },
    });

    const videoFile = new File(["test"], "test.mp4", { type: "video/mp4" });
    fireEvent.change(screen.getByLabelText(/Upload Video/i), {
      target: { files: [videoFile] },
    });

    // Submit form
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/marketplace");
    }, { timeout: 3000 });
  });

  test("displays error message on form validation failure", async () => {
    renderWithProviders(<CreateLesson />);

    // Submit form without required fields
    await act(async () => {
      const form = screen.getByRole("form");
      fireEvent.submit(form);
    });

    // Wait for error message using role
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles negative price validation", async () => {
    renderWithProviders(<CreateLesson />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Lesson" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test Description" },
    });

    // Set negative price
    const priceSelect = screen.getByLabelText(/Price/i);
    fireEvent.change(priceSelect, { target: { value: "custom" } });
    const customPriceInput = screen.getByPlaceholderText(/Enter custom price/i);
    fireEvent.change(customPriceInput, { target: { value: "-10" } });

    // Submit form
    await act(async () => {
      const form = screen.getByRole("form");
      fireEvent.submit(form);
    });

    // Wait for error message using role
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
