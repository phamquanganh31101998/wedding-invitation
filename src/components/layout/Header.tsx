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
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo/Title */}
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            Our Wedding
          </Text>

          {/* Desktop Navigation */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Text
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
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle menu"
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
          />
        </Flex>

        {/* Mobile Navigation */}
        {isOpen && (
          <Box pb={4} display={{ base: 'block', md: 'none' }}>
            <VStack spacing={2} align="start">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button variant="ghost" w="full" justifyContent="flex-start">
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
