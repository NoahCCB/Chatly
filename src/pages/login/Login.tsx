import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Box,
  HStack,
} from '@chakra-ui/react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../firebase'; // Import your Firebase auth and firestore instance
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const publicChatroomId = 'jTV4E9kk4ZS0pwtlOG9V'; // Public chatroom ID

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error message
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        const chatroomDoc: any = await getDoc(doc(db, 'chatrooms', publicChatroomId));
        if (chatroomDoc.exists()) {
          const chatroomData = chatroomDoc.data();
          if (chatroomData && chatroomData.users && chatroomData.users[user.uid]) {
            setUser(user);
            navigate('/chatroom');
            console.log('Login successful!');
          } else {
            const chatroomRef = doc(db, 'chatrooms', publicChatroomId);
            try {
              await updateDoc(chatroomRef, {
                [`users.${user.uid}`]: user.displayName,
              });
              setUser(user);
              navigate('/chatroom');
              console.log('User added to chatroom:', user.displayName);
            } catch (error) {
              console.error('Error updating chatroom:', error);
              setError('Error registering the user');
            }
          }
        } else {
          setError('Public chatroom not found.');
        }
      } else {
        setError('Please verify your email before logging in.');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        setResendLoading(true);
        await sendEmailVerification(auth.currentUser);
        setError('Verification email resent. Please check your inbox.');
      } catch (error: any) {
        setError('Error resending verification email: ' + error.message);
      } finally {
        setResendLoading(false);
      }
    }
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <VStack spacing={4} align="stretch" w="100%" alignItems={"center"} mt={5}>
      <Box w={{ base: "100%", md: "50%" }}>
        <Text fontSize="2xl" mb={5}>Login</Text>
        {error && (
          <Alert status="error" flexDirection="column" alignItems="flex-start">
           
            <Box>
              <HStack>
                <AlertIcon />
                <Text>{error}</Text>
              </HStack>
              {error.includes('verify your email') && (
                <Button
                  size="sm"
                  variant="link"
                  onClick={resendVerificationEmail}
                  isLoading={resendLoading}
                  mt={2}
                >
                  Resend Verification Email
                </Button>
              )}
            </Box>
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    onClick={togglePasswordVisibility}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Button type="submit" colorScheme="blue">
              Login
            </Button>
            <Button variant="link" onClick={navigateToRegister}>
              Create an account
            </Button>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
};

export default Login;