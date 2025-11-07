'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
} from '@chakra-ui/react';
import { useGalleryPhotos } from '@/features/gallery/services/gallery.hooks';
import { GallerySectionProps } from '@/types/gallery';
import { PhotoGrid } from './PhotoGrid';
import { Lightbox } from './Lightbox';

export function GallerySection({
  tenantSlug,
  title = 'Our Gallery',
  description = 'Capturing our beautiful moments together',
}: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fetch gallery photos using the existing hook
  const {
    data: galleryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGalleryPhotos(tenantSlug);

  const photos = galleryData?.photos || [];

  // Handle photo click to open lightbox
  const handlePhotoClick = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  // Handle lightbox close
  const handleLightboxClose = useCallback(() => {
    setIsLightboxOpen(false);
    setLightboxIndex(-1);
  }, []);

  // Handle lightbox navigation
  const handleLightboxNext = useCallback(() => {
    if (lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, photos.length]);

  const handleLightboxPrevious = useCallback(() => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  // Keyboard navigation is now handled by the Lightbox component itself

  return (
    <Box
      as="section"
      py={{ base: 1 }}
      role="region"
      aria-labelledby="gallery-heading"
    >
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Gallery Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h2"
              id="gallery-heading"
              size={{ base: 'md', md: 'md' }}
              fontWeight="light"
              color="brand.700"
              transition="color 0.2s ease"
              _hover={{ color: 'brand.600' }}
            >
              {title}
            </Heading>
            {description && (
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.600"
                maxW="2xl"
                lineHeight="tall"
              >
                {description}
              </Text>
            )}
          </VStack>

          {/* Error State */}
          {isError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Unable to load photos</AlertTitle>
                <AlertDescription>
                  {error?.message ||
                    'Something went wrong while loading the gallery.'}
                </AlertDescription>
              </Box>
              <Button
                ml="auto"
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </Alert>
          )}

          {/* Photo Grid */}
          <PhotoGrid
            photos={photos}
            onPhotoClick={handlePhotoClick}
            isLoading={isLoading}
          />

          {/* Empty State */}
          {!isLoading && !isError && photos.length === 0 && (
            <VStack spacing={4} py={12} textAlign="center">
              <Text fontSize="lg" color="gray.500">
                No photos available yet
              </Text>
              <Text fontSize="sm" color="gray.400">
                Check back soon for beautiful memories!
              </Text>
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Lightbox */}
      {photos.length > 0 && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={handleLightboxClose}
          onNext={handleLightboxNext}
          onPrevious={handleLightboxPrevious}
        />
      )}
    </Box>
  );
}
