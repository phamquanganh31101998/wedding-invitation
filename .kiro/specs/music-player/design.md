# Music Player Design Document

## Overview

The music player will be implemented as a floating, persistent audio control that enhances the wedding website experience. It will be a minimalist, elegant component that provides essential playback controls while maintaining the website's aesthetic integrity.

## Architecture

### Component Structure

```
MusicPlayer (Client Component)
├── FloatingMusicButton (UI Component)
├── AudioContext (React Context)
├── useAudioPlayer (Custom Hook)
├── usePlaylist (Custom Hook)
├── AudioService (Utility)
└── PlaylistService (Utility)
```

### State Management

- **React Context**: Global audio state shared across all pages
- **Local Storage**: Persist user preferences (volume, last played state)
- **Custom Hook**: Encapsulate audio logic and state management

### Integration Points

- **App Layout**: Music player rendered at root level for persistence
- **Chakra UI Theme**: Styled using theme tokens for consistency
- **Next.js App Router**: Compatible with client/server component architecture

## Components and Interfaces

### MusicPlayer Component

```typescript
interface MusicPlayerProps {
  theme?: 'light' | 'dark';
}

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentTrack: Track | null;
  playlist: Track[];
  currentTrackIndex: number;
}

interface Track {
  id: string;
  filename: string;
  title: string;
  artist?: string;
  src: string;
}
```

### FloatingMusicButton Component

- **Position**: Fixed positioning at bottom-left (20px from edges)
- **Size**: 56px diameter (standard FAB size)
- **States**: Play, Pause, Loading, Error, Hidden
- **Animation**: Smooth transitions between states
- **Responsive**: Adjusts position on mobile (16px from edges)

### AudioContext Provider

```typescript
interface AudioContextValue {
  state: AudioState;
  controls: {
    play: () => void;
    pause: () => void;
    next: () => void;
    previous: () => void;
    setVolume: (volume: number) => void;
    seek: (time: number) => void;
    shufflePlaylist: () => void;
  };
}
```

### useAudioPlayer Hook

Encapsulates:

- HTML5 Audio API interactions
- State management logic
- Error handling
- Volume control
- Playback persistence

### usePlaylist Hook

Encapsulates:

- Track list management from data/musics folder
- Random shuffle functionality on initialization
- Track navigation (next/previous)
- Playlist loading and parsing
- File system integration for track discovery

## Data Models

### Audio Configuration

```typescript
interface AudioConfig {
  autoplay: boolean;
  loop: boolean;
  shuffle: boolean;
  preload: 'none' | 'metadata' | 'auto';
}
```

### Playlist Configuration

```typescript
interface PlaylistConfig {
  musicFolder: string; // 'data/musics'
  supportedFormats: string[]; // ['.mp3', '.wav', '.ogg']
  shuffleOnLoad: boolean;
}
```

### User Preferences

```typescript
interface AudioPreferences {
  volume: number;
  wasPlaying: boolean;
  lastPosition: number;
  currentTrackIndex: number;
  shuffledPlaylist: string[]; // Track IDs in shuffled order
}
```

## Error Handling

### Audio Loading Failures

1. **Network Issues**: Retry mechanism with exponential backoff
2. **Unsupported Format**: Graceful degradation, hide player
3. **Autoplay Blocked**: Show play button, inform user
4. **General Errors**: Log error, display fallback state

### Error States

- **Loading Error**: Hide music player completely
- **Playback Error**: Show error icon with tooltip
- **Network Error**: Show retry option

### Error Recovery

```typescript
interface ErrorRecovery {
  maxRetries: number;
  retryDelay: number;
  fallbackBehavior: 'hide' | 'show-error' | 'retry';
}
```

## Accessibility Implementation

### Keyboard Navigation

- **Space/Enter**: Toggle play/pause
- **Tab**: Focus on player button
- **Escape**: Remove focus

### Screen Reader Support

```typescript
interface A11yAttributes {
  'aria-label': string;
  'aria-pressed': boolean;
  'aria-describedby': string;
  role: 'button';
}
```

### Visual Accessibility

- **High Contrast**: Theme-aware color adjustments
- **Focus Indicators**: Clear visual focus states
- **Motion Preferences**: Respect `prefers-reduced-motion`

## Responsive Design

### Breakpoints (Chakra UI)

- **Mobile (base)**: 16px from edges, 48px diameter
- **Tablet (md)**: 20px from edges, 56px diameter
- **Desktop (lg+)**: 24px from edges, 56px diameter

### Touch Targets

- **Minimum Size**: 44px (iOS) / 48px (Android)
- **Touch Area**: Extends beyond visual button
- **Gesture Support**: Tap to toggle, no swipe gestures

## Performance Considerations

### Audio Loading Strategy

1. **Lazy Loading**: Load audio only when user interacts
2. **Preload Metadata**: Get duration without full download
3. **Progressive Enhancement**: Works without JavaScript

### Memory Management

- **Audio Cleanup**: Proper disposal of audio resources
- **Event Listeners**: Remove listeners on unmount
- **State Persistence**: Minimal localStorage usage

### Bundle Size

- **Tree Shaking**: Import only used Chakra components
- **Code Splitting**: Separate audio utilities
- **Compression**: Optimize audio files

## Playlist Management

### File System Integration

The music player will read audio files from the `data/musics` folder:

```
data/
└── musics/
    ├── song1.mp3
    ├── song2.mp3
    └── song3.wav
```

### PlaylistService Utility

```typescript
interface PlaylistService {
  loadTracksFromFolder: (folderPath: string) => Promise<Track[]>;
  shuffleArray: <T>(array: T[]) => T[];
  parseTrackMetadata: (filename: string) => { title: string; artist?: string };
}
```

### Track Loading Strategy

1. **Server-Side**: API endpoint to list files in data/musics
2. **Client-Side**: Fetch track list and create playlist
3. **Shuffle**: Randomize track order on initial load
4. **Metadata**: Extract title from filename (e.g., "Artist - Title.mp3")

### API Endpoint

```typescript
// /api/music/tracks
interface TracksResponse {
  tracks: {
    filename: string;
    title: string;
    artist?: string;
    src: string;
  }[];
}
```

## Integration with Existing System

### Chakra UI Theme Integration

```typescript
const musicPlayerTheme = {
  components: {
    MusicPlayer: {
      baseStyle: {
        position: 'fixed',
        bottom: 4,
        left: 4,
        zIndex: 'overlay',
      },
      variants: {
        wedding: {
          bg: 'brand.primary',
          color: 'white',
          _hover: { bg: 'brand.secondary' },
        },
      },
    },
  },
};
```

### Next.js App Router Compatibility

- **Client Component**: Marked with 'use client' directive
- **Layout Integration**: Rendered in root layout
- **SSR Considerations**: Hydration-safe implementation

### Wedding Website Integration

- **Theme Consistency**: Uses existing color palette
- **Typography**: Matches website font choices
- **Spacing**: Follows established design system
- **Animation**: Consistent with site transitions

## Testing Strategy

### Unit Tests

- **Audio State Management**: Hook behavior testing
- **Component Rendering**: Snapshot and interaction tests
- **Error Handling**: Failure scenario coverage
- **Accessibility**: A11y compliance testing

### Integration Tests

- **Cross-Page Navigation**: State persistence testing
- **Theme Integration**: Visual consistency verification
- **Responsive Behavior**: Breakpoint testing
- **Browser Compatibility**: Audio API support testing

### Manual Testing

- **Accessibility**: Screen reader and keyboard testing
- **Performance**: Audio loading and playback testing
- **User Experience**: Real-world usage scenarios
- **Device Testing**: Mobile and desktop verification

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage for core logic
- **Integration Tests**: Key user flows covered
- **Accessibility Tests**: WCAG 2.1 AA compliance
- **Performance Tests**: Loading time benchmarks

## Security Considerations

### Content Security Policy

- **Audio Sources**: Whitelist trusted audio domains
- **Inline Styles**: Avoid inline styles for CSP compliance

### Privacy

- **No Tracking**: No analytics on audio usage
- **Local Storage**: Minimal data persistence
- **Third-party**: No external audio services

## Deployment Considerations

### Audio File Management

- **Format Support**: MP3 for broad compatibility
- **File Size**: Optimize for web delivery
- **CDN**: Consider audio file hosting strategy
- **Fallbacks**: Multiple format support if needed

### Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+
- **Audio API**: HTML5 Audio support required
- **Graceful Degradation**: Hide player on unsupported browsers
