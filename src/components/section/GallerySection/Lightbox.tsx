'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  IconButton,
  Text,
  HStack,
  VStack,
  useBreakpointValue,
  Spinner,
} from '@chakra-ui/react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { LightboxProps } from '@/types/gallery';

export function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: LightboxProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const currentPhoto = photos[currentIndex];

  // Touch gesture state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Image preloading state
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const [imageLoading, setImageLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Preload adjacent images for smoother navigation
  const preloadAdjacentImages = useCallback(() => {
    if (!isOpen || photos.length <= 1) return;

    const imagesToPreload: string[] = [];

    // Preload next image
    if (currentIndex < photos.length - 1) {
      imagesToPreload.push(photos[currentIndex + 1].url);
    }

    // Preload previous image
    if (currentIndex > 0) {
      imagesToPreload.push(photos[currentIndex - 1].url);
    }

    imagesToPreload.forEach((url) => {
      if (!preloadedImages.has(url)) {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          setPreloadedImages((prev) => new Set(prev).add(url));
        };
      }
    });
  }, [isOpen, currentIndex, photos, preloadedImages]);

  // Preload images when lightbox opens or current index changes
  useEffect(() => {
    preloadAdjacentImages();
  }, [preloadAdjacentImages]);

  // Handle smooth transitions between photos
  useEffect(() => {
    setImageLoading(true);
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Handle image load completion
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Handle image load error
  const handleImageError = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onPrevious();
          }
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) {
            onNext();
          }
          break;
      }
    },
    [isOpen, currentIndex, photos.length, onClose, onNext, onPrevious]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isDragging) return;
      touchEndX.current = event.touches[0].clientX;
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    const swipeDistance = touchStartX.current - touchEndX.current;
    const absSwipeDistance = Math.abs(swipeDistance);

    // Only trigger navigation if swipe distance is significant
    if (absSwipeDistance > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next photo
        if (currentIndex < photos.length - 1) {
          onNext();
        }
      } else {
        // Swiped right - go to previous photo
        if (currentIndex > 0) {
          onPrevious();
        }
      }
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [
    isDragging,
    currentIndex,
    photos.length,
    onNext,
    onPrevious,
    minSwipeDistance,
  ]);

  // Don't render if not open or no current photo
  if (!isOpen || !currentPhoto) {
    return null;
  }

  const isFirstPhoto = currentIndex === 0;
  const isLastPhoto = currentIndex === photos.length - 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="slideInBottom"
      closeOnOverlayClick={true}
      closeOnEsc={true}
      trapFocus={true}
      blockScrollOnMount={true}
      returnFocusOnClose={true}
    >
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent
        bg="transparent"
        boxShadow="none"
        m={0}
        maxW="100vw"
        maxH="100vh"
        overflow="hidden"
      >
        <ModalCloseButton
          position="fixed"
          top={4}
          right={4}
          zIndex={10}
          size="lg"
          bg="blackAlpha.600"
          color="white"
          _hover={{ bg: 'brand.600', transform: 'scale(1.1)' }}
          _focus={{
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
            bg: 'brand.600',
          }}
          transition="all 0.2s ease"
          aria-label="Close photo gallery"
        />

        <ModalBody p={0} position="relative" h="100vh" overflow="hidden">
          {/* Main Image Container */}
          <Box
            position="relative"
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="black"
          >
            {/* Navigation Buttons - Desktop */}
            {!isMobile && (
              <>
                <IconButton
                  aria-label="Previous photo"
                  icon={<ChevronLeftIcon boxSize={8} />}
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={5}
                  size="lg"
                  bg="blackAlpha.600"
                  color="white"
                  _hover={{
                    bg: 'brand.600',
                    transform: 'translateY(-50%) scale(1.1)',
                  }}
                  _focus={{
                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
                    bg: 'brand.600',
                  }}
                  _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
                  isDisabled={isFirstPhoto}
                  onClick={onPrevious}
                  transition="all 0.2s ease"
                />

                <IconButton
                  aria-label="Next photo"
                  icon={<ChevronRightIcon boxSize={8} />}
                  position="absolute"
                  right={4}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={5}
                  size="lg"
                  bg="blackAlpha.600"
                  color="white"
                  _hover={{
                    bg: 'brand.600',
                    transform: 'translateY(-50%) scale(1.1)',
                  }}
                  _focus={{
                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
                    bg: 'brand.600',
                  }}
                  _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
                  isDisabled={isLastPhoto}
                  onClick={onNext}
                  transition="all 0.2s ease"
                />
              </>
            )}

            {/* Image */}
            <Box
              ref={imageContainerRef}
              position="relative"
              w="90vw"
              h="90vh"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              cursor={isDragging ? 'grabbing' : 'grab'}
              userSelect="none"
            >
              {/* Loading overlay for smooth transitions */}
              {(imageLoading || isTransitioning) && (
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={2}
                >
                  <VStack spacing={3}>
                    <Spinner
                      size="xl"
                      color="white"
                      thickness="3px"
                      speed="0.8s"
                    />
                    <Text color="white" fontSize="sm" opacity={0.8}>
                      Loading photo...
                    </Text>
                  </VStack>
                </Box>
              )}

              <Image
                src={currentPhoto.url}
                alt={
                  currentPhoto.name ||
                  `Photo ${currentIndex + 1} of ${photos.length}`
                }
                fill
                style={{
                  objectFit: 'contain',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isDragging
                    ? 'scale(0.98)'
                    : isTransitioning
                      ? 'scale(1.02)'
                      : 'scale(1)',
                  opacity: imageLoading || isTransitioning ? 0.3 : 1,
                  pointerEvents: 'none',
                }}
                sizes="90vw"
                quality={95}
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                role="img"
                aria-describedby="photo-info"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </Box>

            {/* Photo Info Overlay - Bottom */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="blackAlpha.700"
              color="white"
              p={4}
              id="photo-info"
            >
              <VStack spacing={2} align="center">
                {/* Photo Counter */}
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  aria-live="polite"
                  aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
                >
                  {currentIndex + 1} of {photos.length}
                </Text>

                {/* Photo Caption */}
                {currentPhoto.name && (
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    textAlign="center"
                    maxW="container.md"
                    role="caption"
                  >
                    {currentPhoto.name}
                  </Text>
                )}

                {/* Mobile Navigation */}
                {isMobile && (
                  <HStack spacing={4} pt={2}>
                    <IconButton
                      aria-label="Previous photo"
                      icon={<ChevronLeftIcon boxSize={6} />}
                      size="md"
                      bg="blackAlpha.600"
                      color="white"
                      _hover={{ bg: 'brand.600', transform: 'scale(1.1)' }}
                      _focus={{
                        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
                        bg: 'brand.600',
                      }}
                      _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
                      isDisabled={isFirstPhoto}
                      onClick={onPrevious}
                      transition="all 0.2s ease"
                    />

                    <IconButton
                      aria-label="Next photo"
                      icon={<ChevronRightIcon boxSize={6} />}
                      size="md"
                      bg="blackAlpha.600"
                      color="white"
                      _hover={{ bg: 'brand.600', transform: 'scale(1.1)' }}
                      _focus={{
                        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
                        bg: 'brand.600',
                      }}
                      _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
                      isDisabled={isLastPhoto}
                      onClick={onNext}
                      transition="all 0.2s ease"
                    />
                  </HStack>
                )}
              </VStack>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
