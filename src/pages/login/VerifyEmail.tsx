import React, { useEffect } from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatroomId = 'jTV4E9kk4ZS0pwtlOG9V';

  const handleLoginNavigation = () => {
    navigate('/login'); // Navigate to the login page
  };

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user && user.emailVerified) {
        handleLoginNavigation();
      }
    };
    

    checkEmailVerification();
  }, [user]);

  return (
    <VStack spacing={4} align="stretch" w="100%" alignItems={"center"} mt={5}>
      <Box w={{ base: "100%", md: "50%" }} textAlign="center">
        <Text fontSize="2xl" mb={5}>Verify Your Email</Text>
        <Text mb={5}>
          A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your email.
        </Text>
        <Text mb={5}>
          Once your email is verified, you can log in using your credentials.
        </Text>
        <Button colorScheme="blue" onClick={handleLoginNavigation}>
          Go to Login
        </Button>
      </Box>
    </VStack>
  );
};

export default VerifyEmail;
