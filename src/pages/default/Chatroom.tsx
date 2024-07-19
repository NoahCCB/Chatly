import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, Button, VStack, Text, Card, HStack, Flex, IconButton, useDisclosure, Icon, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaUserCircle, FaReply, FaRegThumbsUp, FaRegThumbsDown, FaThumbsDown } from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import { User } from '../../types/User';
import { useUser } from '../../contexts/UserContext';


const Chatroom = () => {
    const { user }: any = useAuth();
    const { userData } = useUser();
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [replyTo, setReplyTo] = useState<any>(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const navigate = useNavigate();
    const endOfMessagesRef = useRef<any>(null);
    const grey = '#e0e0e0';

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
                likes: [],
                dislikes: [],
                replies: []
            });
            setMessage('');
          }
    };

    const handleLike = async (msgId: any) => {
        const messageRef = doc(db, 'messages', msgId);
        const messageSnap = await getDoc(messageRef);
        if (messageSnap.exists()) {
            const messageData = messageSnap.data();
            const updatedLikes = messageData.likes.includes(user?.uid) ? messageData.likes.filter((uid: any) => uid !== user?.uid) : [...messageData.likes, user?.uid];
            await updateDoc(messageRef, { likes: updatedLikes, dislikes: messageData.dislikes.filter((uid: any) => uid !== user?.uid) });
        }
        setSelectedMessageId(null);
    };

    const handleDislike = async (msgId: any) => {
        const messageRef = doc(db, 'messages', msgId);
        const messageSnap = await getDoc(messageRef);
        if (messageSnap.exists()) {
            const messageData = messageSnap.data();
            const updatedDislikes = messageData.dislikes.includes(user?.uid) ? messageData.dislikes.filter((uid: any) => uid !== user?.uid) : [...messageData.dislikes, user.uid];
            await updateDoc(messageRef, { dislikes: updatedDislikes, likes: messageData.likes.filter((uid: any) => uid !== user?.uid) });
        }
        setSelectedMessageId(null);
    };

    const handleReply = (msgId: any) => {
        setReplyTo(msgId);
        setSelectedMessageId(null);
    };

    const renderMenu = (msgId: any) => (
        <Menu isOpen>
            <MenuList>
                <MenuItem onClick={() => handleLike(msgId)}>Like</MenuItem>
                <MenuItem onClick={() => handleDislike(msgId)}>Dislike</MenuItem>
                <MenuItem onClick={() => handleReply(msgId)}>Reply</MenuItem>
            </MenuList>
        </Menu>
    );

    const toggleMenu = (msgId?: any | null) => {
        if (msgId === selectedMessageId) {
            setSelectedMessageId(null);
        } else {
            setSelectedMessageId(msgId);
        }
        
    }

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
                onClick={toggleMenu}
            >
                {messages.map((msg: any) => {
                    const isUser = (msg.username === user?.displayName);
                    return (
                        <Flex key={msg.id} mt={3} justifyContent={isUser ? 'flex-end' : 'flex-start'}>
                            <Box maxW="60%">
                                {msg.username === user?.displayName ? (     
                                    <Box mt={3}></Box>
                                ) : (
                                    <Text fontWeight="bold">{msg.username}</Text>
                                )}
                                <Box
                                    bg={isUser ? (userData?.profileColor) : grey}
                                    p={3}
                                    borderRadius="lg"
                                    mr={isUser ? 0 : 'auto'}
                                    ml={isUser ? 'auto' : 0}
                                    onClick={(e) => { e.stopPropagation(); toggleMenu(msg.id); }}
                                    position="relative"
                                >
                                    <Text>{msg.text}</Text>
                                    
                                    {selectedMessageId === msg.id && renderMenu(msg.id)}
                                    
                                    {msg.likes.length > 0 && (
                                        <>
                                        {(msg.likes.length > 1 || msg.dislikes.length > 0) && (
                                            <Box 
                                            position="absolute" 
                                            top={-5} 
                                            left={isUser ? -3 : 'auto' } 
                                            right={isUser ? 'auto' : -3}
                                            w="9"
                                            h="9"
                                            px={2}
                                            pt={2}
                                            borderRadius="50%"
                                            borderWidth={2}
                                            borderColor={"white"}
                                            bgColor={grey}
                                            zIndex={1}
                                            />
                                        )}
                                            <Box 
                                                position="absolute" top={-5} 
                                                left={isUser ? -5 : 'auto' } 
                                                right={isUser ? 'auto' : -5}
                                                borderRadius="50%"
                                                w="9"
                                                h="9"
                                                px={2}
                                                pt={1}
                                                borderWidth={2}
                                                borderColor={"white"}
                                                zIndex={2}
                                                bgColor={msg.likes.includes(user?.uid) ? userData?.profileColor : grey}
                                            >
                                                <Icon as={FaThumbsUp} color="white"/>
                                            </Box>
                                            </>
                                    )}
                                    {msg.dislikes.length > 0 && (
                                        <>
                                        {(msg.dislikes.length > 1 || msg.likes.length > 0) && (
                                            <Box 
                                            position="absolute" 
                                            top={-5} 
                                            left={isUser ? -3 : 'auto' } 
                                            right={isUser ? 'auto' : -3}
                                            w="9"
                                            h="9"
                                            px={2}
                                            pt={2}
                                            borderRadius="50%"
                                            borderWidth={2}
                                            borderColor={"white"}
                                            bgColor={grey}
                                            zIndex={1}
                                            />
                                        )}
                                        <Box 
                                            position="absolute" 
                                            top={-5} 
                                            left={isUser ? -5 : 'auto' } 
                                            right={isUser ? 'auto' : -5}
                                            w="9"
                                            h="9"
                                            px={2}
                                            pt={2}
                                            borderRadius="50%"
                                            borderWidth={2}
                                            borderColor={"white"}
                                            zIndex={2}
                                            bgColor={msg.dislikes.includes(user?.uid) ? userData?.profileColor : grey}
                                        >
                                            <Icon as={FaThumbsDown} color="white"/>
                                        </Box>
                                        </>
                                    )}
                                    
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
                    )})}
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
