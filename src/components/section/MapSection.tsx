'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
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
  title = 'CTM Palace',
  address = 'CTM Palace, Hanoi, Vietnam',
  embedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18978.335723756078!2d105.79183096520019!3d21.04390847444703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab313282ca37%3A0x93c5760e067d47f4!2sCTM%20Palace!5e0!3m2!1sen!2s!4v1760497437450!5m2!1sen!2s',
  width = '100%',
  height = '450px',
  aspectRatio = 4 / 3,
}: MapSectionProps) => {
  const handleGetDirections = () => {
    const directionsUrl =
      'https://www.google.com/maps/dir/?api=1&destination=CTM+Palace,+Hanoi,+Vietnam';
    window.open(directionsUrl, '_blank');
  };

  return (
    <Container maxW="100%">
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

        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleGetDirections}
            width={['full', 'auto']}
          >
            Get Directions
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default MapSection;
