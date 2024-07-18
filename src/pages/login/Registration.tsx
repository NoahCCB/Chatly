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
  InputRightElement,
  IconButton,
  InputGroup,
  Box,
} from '@chakra-ui/react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase'; // Import your Firebase auth instance
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { doc, setDoc } from 'firebase/firestore';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useAuth();
    const navigate = useNavigate(); // Hook to navigate programmatically
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const userDocRef = doc(db, 'users', userCredential.user.uid);
            
            await setDoc(userDocRef, {
                displayName: username,
                profileColor: '#808080', // Default profile color
            });

            await updateProfile(userCredential.user, { 
                displayName: username
            });

            
            setUser(userCredential.user);
            
            navigate('/chatroom');
            console.log('Registration successful!');
        } catch (error: any) {
            setError(error.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <VStack spacing={4} align="stretch" w="100%" alignItems={"center"} mt={5}>
        <Box w={{ base: "100%", md: "50%" }}>
        <Text fontSize="2xl" mb={5}>Register</Text>
        {error && (
            <Alert status="error">
            <AlertIcon />
            {error}
            </Alert>
        )}
        <form onSubmit={handleRegister}>
            <VStack spacing={4} align="stretch">
            
            <FormControl>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </FormControl>
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
                Register
            </Button>
            </VStack>
        </form>
        </Box>
        </VStack>
    );
};

export default Register;
  
