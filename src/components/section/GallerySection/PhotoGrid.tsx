import React from 'react';
import { SimpleGrid, Skeleton, Box } from '@chakra-ui/react';
import { PhotoGridProps } from '@/types/gallery';
import { PhotoItem } from './PhotoItem';

// CSS animation styles
const fadeInAnimations = `
  @keyframes fadeInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInFromRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export function PhotoGrid({ photos, onPhotoClick, isLoading }: PhotoGridProps) {
  // Show loading skeletons while data is being fetched
  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: fadeInAnimations }} />
        <SimpleGrid columns={1} spacing={{ base: 4, md: 6 }} w="full">
          {Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={index}
              style={{
                animation: `${
                  index % 2 === 0 ? 'fadeInFromLeft' : 'fadeInFromRight'
                } 0.8s ease forwards`,
                animationDelay: `${index * 0.2}s`,
                opacity: 0,
              }}
            >
              <Skeleton
                aspectRatio={1 / 1}
                borderRadius="lg"
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
      <style dangerouslySetInnerHTML={{ __html: fadeInAnimations }} />
      <SimpleGrid
        columns={1}
        spacing={{ base: 4, md: 6 }}
        w="full"
        role="grid"
        aria-label="Photo gallery grid"
      >
        {photos.map((photo, index) => (
          <Box
            key={photo.id}
            role="gridcell"
            transition="transform 0.3s ease, opacity 0.3s ease"
            _hover={{ transform: 'scale(1.02)' }}
            style={{
              animation: `${
                index % 2 === 0 ? 'fadeInFromLeft' : 'fadeInFromRight'
              } 0.8s ease forwards`,
              animationDelay: `${index * 0.2}s`,
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
