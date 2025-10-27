'use client';

import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';

interface RSVPSuccessAlertProps {
  onReset: () => void;
}

const RSVPSuccessAlert: React.FC<RSVPSuccessAlertProps> = ({ onReset }) => {
  return (
    <Box maxW={{ base: '100%', sm: 'md' }} p={{ base: 4, sm: 6 }} w="full">
      <Alert
        status="success"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minHeight={{ base: '180px', sm: '200px' }}
        borderRadius="lg"
        p={{ base: 4, sm: 6 }}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Gửi RSVP Thành Công!
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Cảm ơn phản hồi của bạn. Chúng tôi mong được ăn mừng cùng bạn!
        </AlertDescription>
        <Button
          mt={4}
          colorScheme="blue"
          variant="outline"
          onClick={onReset}
          size={{ base: 'sm', sm: 'md' }}
          minH="44px"
        >
          Gửi RSVP Khác
        </Button>
      </Alert>
    </Box>
  );
};

export default RSVPSuccessAlert;
