import { Suspense } from 'react';
import { Spinner, VStack } from '@chakra-ui/react';
import HomeContent from '@/components/HomeContent';

function LoadingFallback() {
  return (
    <VStack spacing={8} textAlign="center" py={12} minH="50vh" justify="center">
      <Spinner size="lg" color="brand.500" />
    </VStack>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
