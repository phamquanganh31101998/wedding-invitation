'use client';

import { Box, Flex, Container } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex direction="column" minH="100vh" bg="white">
      <Header />
      <Box flex="1" as="main">
        <Container
          maxW={{
            base: '100%', // Mobile: 100% width
            sm: '420px', // Tablet: 420px max-width
            md: '420px', // Desktop: 420px max-width
            lg: '420px', // Large: 420px max-width
            xl: '420px', // XL: 420px max-width
          }}
          px={{ base: 4, sm: 6 }}
          mx="auto"
        >
          {children}
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout;
