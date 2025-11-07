'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  AspectRatio,
  Container,
} from '@chakra-ui/react';

interface MapSectionProps {
  title?: string;
  address?: string;
  embedUrl?: string;
  width?: string;
  height?: string;
  aspectRatio?: number;
}

const MapSection = ({
  title = '',
  address = '',
  embedUrl = '',
  width = '100%',
  height = '450px',
  aspectRatio = 4 / 3,
}: MapSectionProps) => {
  // Don't render the map if no embedUrl is provided
  if (!embedUrl || embedUrl.trim() === '') {
    return (
      <Container
        maxW={{
          base: '100%',
          sm: '420px',
          md: '420px',
          lg: '420px',
          xl: '420px',
        }}
        paddingX={0}
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="gray.700">
              {title}
            </Heading>
            <Text color="gray.600" fontSize="md">
              {address}
            </Text>
          </VStack>
          <Box
            p={8}
            borderRadius="lg"
            bg="gray.50"
            textAlign="center"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text color="gray.500" fontSize="sm">
              Bản đồ sẽ được cập nhật sớm
            </Text>
          </Box>
        </VStack>
      </Container>
    );
  }
  return (
    <Container
      maxW={{
        base: '100%', // Mobile: 100% width
        sm: '420px', // Tablet: 420px max-width
        md: '420px', // Desktop: 420px max-width
        lg: '420px', // Large: 420px max-width
        xl: '420px', // XL: 420px max-width
      }}
    >
      <VStack spacing={6} align="stretch">
        <VStack spacing={2} textAlign="center">
          <Heading size="lg" color="gray.700">
            {title}
          </Heading>
          <Text color="gray.600" fontSize="md">
            {address}
          </Text>
        </VStack>

        <Box borderRadius="lg" overflow="hidden" boxShadow="lg">
          <AspectRatio ratio={aspectRatio}>
            <iframe
              src={embedUrl}
              width={width}
              height={height}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing ${title}`}
            />
          </AspectRatio>
        </Box>
      </VStack>
    </Container>
  );
};

export default MapSection;
