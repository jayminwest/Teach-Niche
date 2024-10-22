# Coding and Documentation Standards

This document outlines the coding and documentation standards used in the Teach Niche project. Following these standards ensures consistency across the codebase and makes it easier for developers to understand and maintain the code.

## JavaScript/TypeScript

### General

- Use ES6+ features when possible.
- Use `const` for variables that are not reassigned, and `let` for those that are.
- Avoid using `var`.
- Use arrow functions for anonymous functions and method definitions when `this` binding is not required.
- Use template literals for string interpolation.

### Naming Conventions

- Use `camelCase` for variable and function names.
- Use `PascalCase` for class and component names.
- Use `UPPER_SNAKE_CASE` for constants.
- Prefix boolean variables with "is", "has", or "should".

### File Structure

- One React component per file.
- Name files the same as the component they contain.
- Use `.js` extension for JavaScript files and `.ts` for TypeScript files.
- Use `.jsx` and `.tsx` extensions for files containing JSX.

## React

- Use functional components with hooks instead of class components.
- Use the `useState` hook for component state.
- Use the `useEffect` hook for side effects.
- Use the `useCallback` hook for memoizing functions.
- Use the `useMemo` hook for memoizing expensive computations.
- Use prop-types for type checking in JavaScript files.

## Styling

- Use Tailwind CSS classes for styling.
- Avoid inline styles unless necessary for dynamic styling.
- Use `className` prop for applying styles.

## Documentation

### JSDoc

- Use JSDoc comments for documenting components, functions, and complex code blocks.
- Include a brief description, `@param` tags for parameters, and `@returns` tag for return values.
- For React components, document props using the `@param` tag.

Example:
