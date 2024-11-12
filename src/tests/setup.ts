import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { rest } from "msw";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

export const server = setupServer(
  // Mock Supabase Edge Functions
  rest.post(
    `${supabaseUrl}/functions/v1/create-checkout-session`,
    (req, res, ctx) => {
      return res(
        ctx.json({
          sessionUrl: "mock-session-url",
        }),
      );
    },
  ),
  rest.post(
    `${supabaseUrl}/functions/v1/stripe-oauth-callback`,
    (req, res, ctx) => {
      return res(
        ctx.json({
          success: true,
        }),
      );
    },
  ),
  // Add more Edge Function mocks as needed
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
