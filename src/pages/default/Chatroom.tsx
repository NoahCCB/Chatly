import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, Button, VStack, Text, Card, HStack, Flex, IconButton, useDisclosure, Icon } from '@chakra-ui/react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import { User } from '../../types/User';
import { useUser } from '../../contexts/UserContext';


const Chatroom = () => {
    const { user } = useAuth();
    const { userData } = useUser();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [profileColor, setProfileColor] = useState('#808080');
    const navigate = useNavigate();
    const endOfMessagesRef = useRef<any>(null);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData: any = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Scroll to bottom of messages when they update
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (message.trim()) {
            await addDoc(collection(db, 'messages'), {
              text: message,
              username: user?.displayName, 
              userId: user?.uid,
              timestamp: new Date(),
            });
            setMessage('');
          }
    };

    return (
        <VStack w="100%" spacing={4}>
            <Box 
                borderRadius={"md"} 
                bg={"white"} 
                w="full" 
                p={4} 
                borderWidth={1}
                height="400px"
                overflowY="auto"
            >
                {messages.map((msg: any) => (
                    <Flex key={msg.id} mt={3} justifyContent={(msg.username === user?.displayName) ? 'flex-end' : 'flex-start'}>
                        <Box maxW="60%">
                            {msg.username === user?.displayName ? (     
                                <Box mt={3}></Box>
                            ) : (
                                <Text fontWeight="bold">{msg.username}</Text>
                            )}
                            <Box
                                bg={(msg.username === user?.displayName) ? (userData?.profileColor) : '#e0e0e0'}
                                p={3}
                                borderRadius="lg"
                                mr={(msg.username === user?.displayName) ? 0 : 'auto'}
                                ml={(msg.username === user?.displayName) ? 'auto' : 0}
                            >
                                <Text>{msg.text}</Text>
                            </Box>
                            <Text 
                                fontSize="xs" 
                                color="gray.500"
                                textAlign={msg.username === user?.displayName ? 'right' : 'left'}
                            >
                                {new Date(msg.timestamp?.toDate()).toLocaleString()}
                            </Text>
                        </Box>
                    </Flex>
                ))}
            <div ref={endOfMessagesRef} />
            </Box>
            <HStack w="100%">
                <Input
                    bg={"white"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button colorScheme={"blue"} onClick={sendMessage}>Send</Button>
            </HStack>
        </VStack>
    );
};

export default Chatroom;
