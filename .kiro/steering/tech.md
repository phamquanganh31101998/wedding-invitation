# Tech Stack & Development

## Framework & Core Technologies

- **Next.js 15+** with App Router (latest stable)
- **React 19** with TypeScript for type safety
- **Chakra UI v2** for component library and styling
- **Turbopack** for fast development builds
- **CSV files** for simple data storage (no database required)

## Key Dependencies

- **UI & Styling**: `@chakra-ui/react`, `@emotion/react`, `framer-motion`
- **Data Handling**: `csv-parser`, `csv-writer`, `date-fns`
- **Development**: `eslint`, `prettier`, `typescript`

## Build System & Commands

### Development

```bash
yarn dev          # Start dev server with Turbopack
yarn build        # Production build with Turbopack
yarn start        # Start production server
```

### Code Quality

```bash
yarn lint         # Run ESLint
yarn lint:fix     # Auto-fix ESLint issues
yarn format       # Format code with Prettier
yarn format:check # Check formatting without changes
```

## Code Style & Formatting

- **Prettier** configuration: 2-space indentation, single quotes, semicolons, 80 char width
- **ESLint** with Next.js and TypeScript rules + Prettier integration
- **TypeScript** strict mode enabled
- **Import alias**: `@/*` maps to `./src/*`

## Architecture Patterns

- **App Router** structure (not Pages Router)
- **Client Components** marked with `'use client'` directive
- **Server Components** by default (no directive needed)
- **API Routes** in `src/app/api/` directory
- **Component composition** with Chakra UI
- **Theme customization** via `extendTheme()`

## Development Guidelines

- Use **mobile-first** responsive design with Chakra breakpoints
- Prefer **Server Components** unless client interactivity needed
- Follow **Next.js 15 App Router** conventions
- Use **TypeScript interfaces** for all props and data structures
- Implement **proper error handling** for API routes
- Keep **CSV data operations** in utility functions
- Use Yarn as package manager
- Don't write tests (yet)
