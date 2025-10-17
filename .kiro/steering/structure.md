# Project Structure & Organization

## Directory Layout

```
src/
├── app/                    # Next.js App Router pages & API
│   ├── api/rsvp/          # RSVP API endpoints
│   ├── directions/        # Venue directions page
│   ├── embedded-map-demo/ # Map integration demos
│   ├── gallery/          # Photo gallery page
│   ├── map-demo/         # Map functionality demo
│   ├── rsvp/            # RSVP form page
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── layout/          # Header, Footer, Layout components
│   ├── providers/       # Context providers (Chakra, etc.)
│   └── section/         # Page section components
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (CSV handling)

data/
└── rsvp.csv            # RSVP data storage

docs/                   # Component documentation
public/                 # Static assets (images, icons)
```

## File Naming Conventions

- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx` (App Router convention)
- **Components**: PascalCase (e.g., `ChakraProviders.tsx`)
- **Utilities**: camelCase (e.g., `csv.ts`)
- **Types**: `index.ts` for barrel exports
- **API Routes**: `route.ts` (App Router convention)

## Component Organization

### Layout Components (`src/components/layout/`)

- Shared layout elements (Header, Footer, Navigation)
- Page wrapper components

### Section Components (`src/components/section/`)

- Reusable page sections (MapSection, etc.)
- Feature-specific components

### Providers (`src/components/providers/`)

- Context providers and theme configuration
- Global state management

## Import Patterns

- Use `@/*` alias for all internal imports
- Prefer named exports over default exports for utilities
- Group imports: external libraries, then internal modules
- Use barrel exports in `types/index.ts`

## Data Management

- **CSV Storage**: Simple file-based data in `data/` directory
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Utilities**: CSV operations in `src/utils/csv.ts`
- **Types**: Data interfaces in `src/types/index.ts`

## Page Structure

Each page follows this pattern:

1. **Metadata** export for SEO
2. **Server Component** by default
3. **Client Component** only when needed (`'use client'`)
4. **Layout wrapper** for consistent styling
5. **Chakra UI components** for UI elements

## Asset Organization

- **Static files**: `public/` directory
- **Icons**: SVG files in `public/`
- **Images**: Organized by feature/page
- **Fonts**: Google Fonts loaded in layout
