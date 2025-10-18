'use client';

import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  IconButton,
  useDisclosure,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import Link from 'next/link';

const Header = () => {
  const { isOpen, onToggle } = useDisclosure();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'RSVP', href: '/rsvp' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Directions', href: '/directions' },
  ];

  return (
    <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={1000}>
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
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo/Title */}
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            Our Wedding
          </Text>

          {/* Desktop Navigation - Show on larger screens within mobile layout */}
          <HStack spacing={4} display={{ base: 'none', sm: 'flex' }}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Text
                  fontSize="sm"
                  _hover={{ color: 'brand.600', textDecoration: 'underline' }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Text>
              </Link>
            ))}
          </HStack>

          {/* Mobile menu button */}
          <IconButton
            size="sm"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle menu"
            display={{ base: 'flex', sm: 'none' }}
            onClick={onToggle}
          />
        </Flex>

        {/* Mobile Navigation */}
        {isOpen && (
          <Box pb={4} display={{ base: 'block', sm: 'none' }}>
            <VStack spacing={2} align="start">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    size="sm"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Header;
