'use client';

import React, { useState } from 'react';
import {
  Box,
  Text,
  Skeleton,
  AspectRatio,
  useColorModeValue,
} from '@chakra-ui/react';
import Image from 'next/image';
import { PhotoItemProps } from '@/types/gallery';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export function PhotoItem({ photo, onClick, loading = false }: PhotoItemProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  const hoverBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const captionBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');

  // Use intersection observer for optimized lazy loading
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
  });

  // Start loading when element comes into view
  React.useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);

  // Handle image load completion
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (loading) {
    return (
      <AspectRatio ratio={4 / 3}>
        <Skeleton borderRadius="md" />
      </AspectRatio>
    );
  }

  return (
    <Box
      ref={elementRef}
      position="relative"
      cursor="pointer"
      borderRadius="md"
      overflow="hidden"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'scale(1.02)',
        shadow: 'xl',
        borderColor: 'brand.300',
      }}
      _focus={{
        outline: '2px solid',
        outlineColor: 'brand.500',
        outlineOffset: '2px',
      }}
      _active={{
        transform: 'scale(0.98)',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={photo.name ? `View photo: ${photo.name}` : 'View photo'}
      border="2px solid transparent"
    >
      <AspectRatio ratio={4 / 3}>
        <Box position="relative" w="full" h="full">
          {/* Loading skeleton with smooth transition */}
          {(imageLoading || !shouldLoad) && (
            <Skeleton
              position="absolute"
              top={0}
              left={0}
              w="full"
              h="full"
              borderRadius="md"
              startColor="gray.100"
              endColor="gray.200"
              speed={1.2}
              style={{
                transition: 'opacity 0.4s ease-in-out',
                opacity: imageLoading || !shouldLoad ? 1 : 0,
              }}
            />
          )}

          {/* Error state */}
          {imageError ? (
            <Box
              w="full"
              h="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              style={{
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Image unavailable
              </Text>
            </Box>
          ) : shouldLoad ? (
            <Image
              src={photo.url}
              alt={photo.name || 'Gallery photo'}
              fill
              style={{
                objectFit: 'cover',
                transition: 'opacity 0.4s ease-in-out, transform 0.3s ease',
                opacity: imageLoading ? 0 : 1,
                transform: imageLoading ? 'scale(1.05)' : 'scale(1)',
              }}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              quality={85}
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : null}

          {/* Caption overlay for desktop hover */}
          {photo.name && !imageError && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg={captionBg}
              color="white"
              p={3}
              transform="translateY(100%)"
              transition="transform 0.2s ease-in-out"
              _groupHover={{ transform: 'translateY(0)' }}
              sx={{
                '@media (hover: hover)': {
                  _hover: { transform: 'translateY(0)' },
                },
                '@media (hover: none)': {
                  transform: 'translateY(0)',
                  bg: 'transparent',
                  color: 'gray.700',
                  p: 2,
                  pt: 1,
                },
              }}
            >
              <Text
                fontSize="sm"
                fontWeight="medium"
                noOfLines={2}
                lineHeight="short"
              >
                {photo.name}
              </Text>
            </Box>
          )}

          {/* Hover overlay */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={hoverBg}
            opacity={0}
            transition="opacity 0.2s ease-in-out"
            _hover={{ opacity: 1 }}
            display={{ base: 'none', md: 'block' }}
          />
        </Box>
      </AspectRatio>

      {/* Caption below image for mobile */}
      {photo.name && (
        <Box display={{ base: 'block', md: 'none' }} p={2} pt={1}>
          <Text fontSize="sm" color="gray.600" noOfLines={2} lineHeight="short">
            {photo.name}
          </Text>
        </Box>
      )}
    </Box>
  );
}
