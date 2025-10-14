# Wedding Invitation Website

A beautiful, responsive wedding invitation website built with Next.js, Chakra UI, and TypeScript.

## Features

- 📱 **Mobile-first responsive design**
- 💌 **RSVP functionality with CSV data storage**
- 🖼️ **Photo gallery**
- 📍 **Venue directions and maps**
- ⏰ **Countdown timer**
- 🎨 **Elegant UI with Chakra UI**
- 📝 **TypeScript for type safety**
- ✨ **ESLint and Prettier for code quality**

## Project Structure

```
src/
├── app/
│   ├── api/rsvp/          # RSVP API endpoints
│   ├── directions/        # Venue directions page
│   ├── gallery/          # Photo gallery page
│   ├── rsvp/            # RSVP form page
│   ├── layout.tsx       # Root layout with Chakra UI provider
│   └── page.tsx         # Home page
├── components/
│   ├── layout/          # Header, Footer, Layout components
│   └── ui/              # Reusable UI components
├── theme/               # Chakra UI theme configuration
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (CSV handling)

data/
└── rsvp.csv            # RSVP data storage
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Customization

### Wedding Details

Update the following placeholders in the code:

- `[Bride Name]` & `[Groom Name]` - Replace with actual names
- `[Wedding Date]` - Set the wedding date
- `[Venue Name]` & `[Venue Address]` - Update venue information
- `[RSVP Date]` - Set RSVP deadline

### Styling

- Modify `src/theme/index.ts` to customize colors, fonts, and styling
- The theme uses a mobile-first approach with Chakra UI breakpoints

### RSVP Data

- RSVP responses are stored in `data/rsvp.csv`
- Access via the API endpoint `/api/rsvp`

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **UI Library:** Chakra UI v2
- **Language:** TypeScript
- **Styling:** Chakra UI + CSS-in-JS
- **Data Storage:** CSV files
- **Code Quality:** ESLint + Prettier
- **Development:** Turbopack for fast refresh

## Next Steps

This is the basic project structure. You can now:

1. **Customize the content** with your wedding details
2. **Add actual photos** to the gallery
3. **Implement the countdown timer** with your wedding date
4. **Integrate maps** for venue directions
5. **Style and theme** according to your preferences
6. **Add more features** like guest photo uploads, registry links, etc.

## License

Private project for personal use.
