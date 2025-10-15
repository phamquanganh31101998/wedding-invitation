# EmbeddedMapSection Component

The `EmbeddedMapSection` component provides a simple, lightweight alternative to the full Google Maps JavaScript API integration. It uses Google Maps embed iframes for easy implementation without requiring API keys.

## Features

- 🗺️ **Google Maps Embed** - Uses iframe embed (no API key needed)
- 📱 **Responsive Design** - AspectRatio component for mobile-friendly maps
- 🧭 **Get Directions** - Opens Google Maps navigation
- 📋 **Copy Address** - Copy venue address with toast notification
- 🎨 **Chakra UI Styling** - Consistent with your design system
- ⚡ **Lightweight** - No JavaScript API loading required
- 🔧 **Customizable** - Easy to configure and style

## Advantages over MapSection

| Feature              | EmbeddedMapSection | MapSection          |
| -------------------- | ------------------ | ------------------- |
| **Setup Complexity** | ✅ Simple iframe   | ❌ Requires API key |
| **Loading Speed**    | ✅ Fast            | ⚠️ Loads JS API     |
| **Quota Limits**     | ✅ No limits       | ⚠️ API quotas apply |
| **Customization**    | ⚠️ Limited         | ✅ Full control     |
| **Interactivity**    | ⚠️ Basic           | ✅ Full features    |

## Usage

### Basic Usage

```tsx
import EmbeddedMapSection from '@/components/section/EmbeddedMapSection';

export default function VenuePage() {
  return (
    <EmbeddedMapSection
      title="CTM Palace"
      address="CTM Palace, Hanoi, Vietnam"
    />
  );
}
```

### Custom Embed URL

```tsx
import EmbeddedMapSection from '@/components/section/EmbeddedMapSection';

export default function CustomVenuePage() {
  return (
    <EmbeddedMapSection
      title="Your Wedding Venue"
      address="123 Wedding Street, City, Country"
      embedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12..."
      aspectRatio={16 / 9}
      height="500px"
    />
  );
}
```

## Props

| Prop          | Type     | Default                        | Description                       |
| ------------- | -------- | ------------------------------ | --------------------------------- |
| `title`       | `string` | `"CTM Palace"`                 | Venue title displayed above map   |
| `address`     | `string` | `"CTM Palace, Hanoi, Vietnam"` | Address text for display and copy |
| `embedUrl`    | `string` | CTM Palace embed URL           | Google Maps embed iframe src      |
| `width`       | `string` | `"100%"`                       | Map width (CSS value)             |
| `height`      | `string` | `"450px"`                      | Map height (CSS value)            |
| `aspectRatio` | `number` | `4/3`                          | Responsive aspect ratio           |

## Getting Your Embed URL

### Method 1: Google Maps (Recommended)

1. Go to [Google Maps](https://maps.google.com)
2. Search for your venue
3. Click **"Share"** button
4. Select **"Embed a map"** tab
5. Choose map size (Medium/Large recommended)
6. Copy the iframe src URL
7. Use the URL in the `embedUrl` prop

### Method 2: Google My Business

1. Find your business on Google My Business
2. Use the embed code provided
3. Extract the src URL from the iframe

### Example Embed URL Structure

```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d[details]!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s[place_id]!2s[place_name]!5e0!3m2!1sen!2s!4v[timestamp]!5m2!1sen!2s
```

## Styling Customization

### Aspect Ratios

```tsx
// Widescreen
<EmbeddedMapSection aspectRatio={16 / 9} />

// Square
<EmbeddedMapSection aspectRatio={1} />

// Traditional
<EmbeddedMapSection aspectRatio={4 / 3} />

// Tall
<EmbeddedMapSection aspectRatio={3 / 4} />
```

### Custom Container Styling

```tsx
import { Box } from '@chakra-ui/react';

<Box borderRadius="2xl" overflow="hidden" boxShadow="2xl">
  <EmbeddedMapSection {...props} />
</Box>;
```

## Examples

### Wedding Ceremony Location

```tsx
<EmbeddedMapSection
  title="Sacred Heart Cathedral"
  address="1040 Green Street, San Francisco, CA 94133"
  embedUrl="https://www.google.com/maps/embed?pb=..."
  aspectRatio={16 / 9}
/>
```

### Reception Venue

```tsx
<EmbeddedMapSection
  title="Grand Ballroom"
  address="456 Celebration Ave, Party City, PC 12345"
  embedUrl="https://www.google.com/maps/embed?pb=..."
  height="400px"
/>
```

## Responsive Behavior

The component uses Chakra UI's `AspectRatio` component for responsive design:

- **Desktop**: Full width with specified aspect ratio
- **Mobile**: Maintains aspect ratio, adjusts to container width
- **Buttons**: Stack vertically on mobile (`width={['full', 'auto']}`)

## Accessibility Features

- ✅ **Semantic HTML** - Proper iframe with title attribute
- ✅ **Keyboard Navigation** - Buttons are keyboard accessible
- ✅ **Screen Readers** - Descriptive title and labels
- ✅ **Focus Management** - Proper focus indicators

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Internet Explorer 11+ (with polyfills)

## Performance Notes

- **Fast Loading** - No JavaScript API to load
- **Small Bundle Size** - Minimal component code
- **Lazy Loading** - iframe loads with `loading="lazy"`
- **No API Quotas** - Unlimited usage

## Demo

Visit `/embedded-map-demo` to see the component in action with the CTM Palace location.

## When to Use

### Use EmbeddedMapSection when:

- ✅ You want quick, simple implementation
- ✅ You don't need advanced map interactions
- ✅ You want to avoid API key management
- ✅ You have quota/billing concerns

### Use MapSection when:

- ✅ You need custom markers or overlays
- ✅ You want advanced map interactions
- ✅ You need programmatic map control
- ✅ You want custom styling options
