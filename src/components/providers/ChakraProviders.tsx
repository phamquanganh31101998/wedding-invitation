'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
      '@keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(20px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
    },
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
  },
  breakpoints: {
    base: '0em', // 0px - Mobile first
    sm: '26.25em', // ~420px - Small tablets/large phones
    md: '48em', // ~768px - Tablets
    lg: '62em', // ~992px - Small desktops
    xl: '80em', // ~1280px - Large desktops
    '2xl': '96em', // ~1536px - Extra large
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

interface ChakraProvidersProps {
  children: React.ReactNode;
}

export function ChakraProviders({ children }: ChakraProvidersProps) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
