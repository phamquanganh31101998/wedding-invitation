import { Suspense } from 'react';
import {
  Container,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Text,
  Heading,
} from '@chakra-ui/react';
import Link from 'next/link';

interface TenantErrorPageProps {
  searchParams: {
    tenant?: string;
    error?: string;
  };
}

export default function TenantErrorPage({
  searchParams,
}: TenantErrorPageProps) {
  const { tenant, error } = searchParams;

  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={8} textAlign="center">
        <Heading size="lg" color="red.500">
          Wedding Invitation Not Found
        </Heading>

        <Alert status="error" borderRadius="md" maxW="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>
              {tenant ? `Tenant "${tenant}" Not Found` : 'Invalid Request'}
            </AlertTitle>
            <AlertDescription>
              {error || 'The requested wedding invitation could not be found.'}
            </AlertDescription>
          </VStack>
        </Alert>

        <VStack spacing={4}>
          <Text color="gray.600">This could happen if:</Text>
          <VStack spacing={2} align="start" color="gray.500" fontSize="sm">
            <Text>• The invitation link is incorrect or expired</Text>
            <Text>• The wedding invitation has been deactivated</Text>
            <Text>• There was a typo in the URL</Text>
            <Text>• The couple has not set up their invitation yet</Text>
          </VStack>

          <VStack spacing={3} pt={4}>
            <Button as={Link} href="/" colorScheme="brand" size="lg">
              Go to Home Page
            </Button>

            {tenant && (
              <Text fontSize="sm" color="gray.500">
                Looking for a different invitation? Check the URL and try again.
              </Text>
            )}
          </VStack>
        </VStack>
      </VStack>
    </Container>
  );
}

export function generateMetadata({ searchParams }: TenantErrorPageProps) {
  const { tenant } = searchParams;

  return {
    title: `Wedding Invitation Not Found${tenant ? ` - ${tenant}` : ''}`,
    description:
      'The requested wedding invitation could not be found. Please check the URL and try again.',
  };
}
