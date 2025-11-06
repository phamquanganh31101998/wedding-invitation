import React from 'react';
import { SimpleGrid, Skeleton, Box } from '@chakra-ui/react';
import { PhotoGridProps } from '@/types/gallery';
import { PhotoItem } from './PhotoItem';

// CSS animation styles
const fadeInUpAnimation = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export function PhotoGrid({ photos, onPhotoClick, isLoading }: PhotoGridProps) {
  // Show loading skeletons while data is being fetched
  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: fadeInUpAnimation }} />
        <SimpleGrid columns={2} spacing={{ base: 3, md: 4 }} w="full">
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              style={{
                animation: 'fadeInUp 0.6s ease forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              <Skeleton
                aspectRatio={4 / 3}
                borderRadius="md"
                startColor="gray.100"
                endColor="gray.200"
                speed={1.5}
              />
            </Box>
          ))}
        </SimpleGrid>
      </>
    );
  }

  // Render photo grid
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fadeInUpAnimation }} />
      <SimpleGrid
        columns={2}
        spacing={{ base: 3, md: 4 }}
        w="full"
        role="grid"
        aria-label="Photo gallery grid"
      >
        {photos.map((photo, index) => (
          <Box
            key={photo.id}
            role="gridcell"
            transition="transform 0.3s ease, opacity 0.3s ease"
            _hover={{ transform: 'translateY(-2px)' }}
            style={{
              animation: 'fadeInUp 0.6s ease forwards',
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
            }}
          >
            <PhotoItem photo={photo} onClick={() => onPhotoClick(index)} />
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
}
