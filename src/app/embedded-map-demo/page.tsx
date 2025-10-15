import EmbeddedMapSection from '@/components/section/EmbeddedMapSection';
import Layout from '@/components/layout/Layout';
import { Container } from '@chakra-ui/react';

export default function EmbeddedMapDemo() {
  return (
    <Layout>
      <Container maxW="4xl" py={12}>
        <EmbeddedMapSection
          title="CTM Palace"
          address="CTM Palace, Hanoi, Vietnam"
          aspectRatio={16 / 9}
        />
      </Container>
    </Layout>
  );
}
