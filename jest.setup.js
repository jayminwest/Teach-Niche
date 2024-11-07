import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock environment variables
process.env.REACT_APP_SUPABASE_URL = 'https://test-url.supabase.co';
process.env.REACT_APP_SUPABASE_KEY = 'test-key';
process.env.REACT_APP_WELCOME_LESSON_ID = 'test-welcome-lesson-id';

// Add any global test setup here