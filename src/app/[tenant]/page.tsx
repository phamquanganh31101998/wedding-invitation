import { Suspense } from 'react';
import {
  Spinner,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
  Text,
  Button,
} from '@chakra-ui/react';

import HomeContent from '@/components/HomeContent';
import { validateTenantId } from '@/utils/tenant';
import Link from 'next/link';

interface TenantPageProps {
  params: {
    tenant: string;
  };
}

function LoadingFallback() {
  return (
    <VStack spacing={8} textAlign="center" py={12} minH="50vh" justify="center">
      <Spinner size="lg" color="brand.500" />
      <Text color="gray.600">Loading tenant information...</Text>
    </VStack>
  );
}

function TenantErrorFallback({
  tenantId,
  error,
}: {
  tenantId: string;
  error: string;
}) {
  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={6} textAlign="center">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>Tenant Not Found</AlertTitle>
            <AlertDescription>
              The wedding invitation for &quot;{tenantId}&quot; could not be
              found. {error}
            </AlertDescription>
          </VStack>
        </Alert>

        <VStack spacing={4}>
          <Text color="gray.600">This could happen if:</Text>
          <VStack spacing={2} align="start" color="gray.500" fontSize="sm">
            <Text>• The invitation link is incorrect</Text>
            <Text>• The wedding invitation has been deactivated</Text>
            <Text>• There was a typo in the URL</Text>
          </VStack>

          <Button as={Link} href="/" colorScheme="brand" size="lg" mt={4}>
            Go to Home Page
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant: tenantId } = params;

  // Validate tenant ID format and existence
  const validation = await validateTenantId(tenantId);

  if (!validation.isValid) {
    // For invalid tenant IDs, show error page instead of 404
    return (
      <TenantErrorFallback
        tenantId={tenantId}
        error={validation.error || 'Unknown error'}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}

// Generate metadata for the tenant page
export async function generateMetadata({ params }: TenantPageProps) {
  const { tenant: tenantId } = params;

  // Basic validation for metadata generation
  if (!tenantId || !/^[a-zA-Z0-9-_]+$/.test(tenantId)) {
    return {
      title: 'Wedding Invitation - Not Found',
      description: 'The requested wedding invitation could not be found.',
    };
  }

  try {
    const validation = await validateTenantId(tenantId);

    if (validation.isValid) {
      return {
        title: `Wedding Invitation - ${tenantId}`,
        description: `Join us for our special day! Wedding invitation for ${tenantId}.`,
      };
    }
  } catch (error) {
    console.error('Error generating metadata for tenant:', tenantId, error);
  }

  return {
    title: 'Wedding Invitation - Not Found',
    description: 'The requested wedding invitation could not be found.',
  };
}
