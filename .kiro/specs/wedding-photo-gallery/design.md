# Wedding Photo Gallery Design Document

## Overview

The wedding photo gallery is a responsive, elegant photo viewing experience that integrates seamlessly with the existing wedding invitation website. It fetches photos from a backend API and displays them in a clean grid layout with lightbox functionality for detailed viewing.

## Architecture

### Component Structure

```
GallerySection/
├── GallerySection.tsx          # Main gallery container
├── PhotoGrid.tsx               # Grid layout component
├── PhotoItem.tsx               # Individual photo card
├── Lightbox.tsx                # Full-screen photo viewer
├── LoadingState.tsx            # Loading skeleton
└── index.ts                    # Barrel exports
```

### Data Flow

1. **API Request**: Gallery fetches photos from `/api/gallery` endpoint
2. **State Management**: React Query for caching and loading states
3. **Image Loading**: Progressive loading with placeholder states
4. **Lightbox Navigation**: Local state for current photo index

## Components and Interfaces

### GallerySection Component

```typescript
interface GalleryPhoto {
  id: number;
  tenantId: number;
  type: string;
  url: string;
  name: string | null;
  displayOrder: number;
  created_at: string;
}

interface GallerySectionProps {
  title?: string;
  description?: string;
}
```

**Responsibilities:**

- Fetch photos from API using React Query
- Manage lightbox open/close state
- Handle keyboard navigation (ESC to close)
- Provide loading and error states

### PhotoGrid Component

```typescript
interface PhotoGridProps {
  photos: GalleryPhoto[];
  onPhotoClick: (index: number) => void;
  isLoading?: boolean;
}
```

**Responsibilities:**

- Render 2-column responsive grid using Chakra UI SimpleGrid
- Handle photo click events
- Display loading skeletons when needed
- Maintain consistent spacing and aspect ratios

### PhotoItem Component

```typescript
interface PhotoItemProps {
  photo: GalleryPhoto;
  onClick: () => void;
  loading?: boolean;
}
```

**Responsibilities:**

- Display individual photo with proper aspect ratio
- Show caption overlay on hover (desktop) or below image (mobile)
- Handle click events to open lightbox
- Implement lazy loading for performance

### Lightbox Component

```typescript
interface LightboxProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}
```

**Responsibilities:**

- Full-screen photo viewing with navigation
- Touch/swipe gestures for mobile navigation
- Keyboard navigation (arrow keys, ESC)
- Display photo counter and caption
- Smooth transitions between photos

## Data Models

### API Response Structure

```typescript
interface GalleryApiResponse {
  photos: GalleryPhoto[];
  total: number;
}

interface GalleryPhoto {
  id: number;
  tenant_id: number;
  type: string;
  url: string;
  name: string | null;
  display_order: number;
  created_at: string;
}
```

### API Endpoint Design

- **GET /api/gallery**: Returns gallery photos for current tenant
- **Query Parameters**: `type=photo` to filter for gallery photos
- **Response Format**: JSON with photos array and metadata
- **Error Handling**: Standard HTTP status codes with error messages
- **Tenant Context**: Uses tenant slug from middleware for multi-tenant support

## Error Handling

### Loading States

- **Initial Load**: Skeleton grid with placeholder cards
- **Image Loading**: Individual photo loading spinners
- **Lightbox Loading**: Smooth transitions with loading indicators

### Error States

- **API Failure**: Retry button with error message
- **Image Load Failure**: Fallback placeholder with retry option
- **Network Issues**: Offline indicator and cached data fallback

### User Feedback

- Toast notifications for critical errors
- Graceful degradation for missing images
- Clear loading indicators throughout the experience

## Testing Strategy

### Component Testing

- **PhotoGrid**: Verify responsive layout and click handling
- **Lightbox**: Test navigation, keyboard controls, and gestures
- **PhotoItem**: Validate image loading and caption display
- **API Integration**: Mock API responses and error scenarios

### Accessibility Testing

- **Keyboard Navigation**: Full lightbox control via keyboard
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order and focus trapping
- **Color Contrast**: Ensure text readability on image overlays

### Performance Testing

- **Image Loading**: Lazy loading and progressive enhancement
- **Memory Usage**: Efficient image cleanup in lightbox
- **Bundle Size**: Code splitting for lightbox functionality
- **Mobile Performance**: Touch gesture responsiveness

## Implementation Details

### Responsive Design

- **Mobile (< 768px)**: 2-column grid with touch gestures
- **Tablet (768px - 1024px)**: 2-column grid with larger images
- **Desktop (> 1024px)**: 2-column grid with hover effects

### Image Optimization

- Use Next.js Image component for automatic optimization
- Serve WebP format when supported
- Implement responsive image sizes
- Progressive JPEG loading for better perceived performance

### Chakra UI Integration

- Use existing theme colors and spacing
- Leverage Chakra's responsive utilities
- Implement consistent motion and transitions
- Follow established component patterns

### Performance Optimizations

- React Query for efficient data fetching and caching
- Intersection Observer for lazy loading
- Virtual scrolling for large photo collections (future enhancement)
- Image preloading in lightbox for smooth navigation
