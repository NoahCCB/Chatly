import React, { useState, useEffect } from 'react';
import { Box, Input, Button, VStack, Text, Card, HStack } from '@chakra-ui/react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Chatroom from '../pages/default/Chatroom';
import { UserProvider } from '../contexts/UserContext';
import SuggestionForm from '../components/SuggestionForm';
import SuggestionList from '../components/SuggestionList';
import Header from '../components/Header';

const Default = () => {
    const { user } = useAuth();
    const { chatroomId } = useParams();
    const [userData, setUserData] = useState(null);
    
    const defaultId = 'jTV4E9kk4ZS0pwtlOG9V';
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchProfileColor = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData: any = userDocSnap.data();
                    if (userData) {
                        setUserData(userData);
                    }
                }
            }
        };

        fetchProfileColor();
    }, [user]);

    return (
            <UserProvider>
                <VStack alignContent={"center"}>
                    <Header />
                    <Box mt={5} w={{ base: '100%', md: '60%' }}>
                        <Chatroom />
                    </Box>
                </VStack>
            </UserProvider>
    );
};

export default Default;
