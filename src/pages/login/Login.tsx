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
} from '@chakra-ui/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Import your Firebase auth instance
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate('/chatroom');
      console.log('Login successful!');
    } catch (error: any) {
      setError(error.message);
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
          <Alert status="error">
            <AlertIcon />
            {error}
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
