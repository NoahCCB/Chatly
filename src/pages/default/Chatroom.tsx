import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, Button, VStack, Text, Card, HStack, Flex, IconButton, useDisclosure, Icon, Menu, MenuButton, MenuList, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Stack, Heading, Link } from '@chakra-ui/react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, updateDoc, where } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { FaThumbsUp, FaUserCircle, FaReply, FaRegThumbsUp, FaRegThumbsDown, FaThumbsDown } from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import { User } from '../../types/User';
import { useUser } from '../../contexts/UserContext';
import { getName } from '../../utils/ui';
import ChatroomModal from '../../components/ChatroomModal';


const Chatroom = () => {
    const { chatroomId } = useParams();
    const { user }: any = useAuth();
    const { userData } = useUser();
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const navigate = useNavigate();
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const endOfMessagesRef = useRef<any>(null);
    const grey = '#e0e0e0';
    const defaultId = 'jTV4E9kk4ZS0pwtlOG9V';
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [chatroom, setChatroom] = useState<any>(null);

    useEffect(() => {
        fetchChatroom();
        const q = query(collection(db, 'messages'), where('chatroomId', '==', chatroomId || defaultId), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData: any = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
            console.log(messagesData);
        });
        
        return () => unsubscribe();
        
    }, [chatroomId]);

    const fetchChatroom = async () => {
        console.log("fetching class", chatroomId);
       
    
        const chatroomRef = doc(db, 'chatrooms', chatroomId || defaultId);
        const chatroomSnap: any = await getDoc(chatroomRef);
        if (chatroomSnap.exists()) {
            setChatroom(chatroomSnap.data());
            console.log("Chatroom: ", chatroomSnap.data());
        } else {
            console.error("No such chatroom!");
        }
        
    };


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
                chatroomId: chatroomId || defaultId,
                timestamp: new Date(),
                likes: [],
                dislikes: [],
                replyTo: replyTo || null
            });
            setMessage('');
            setReplyTo(null);
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

    const handleReply = (msgId: string) => {
        setReplyTo(msgId);
        setSelectedMessageId(null);
    };

    const renderMenu = (msgId: any, isUser: boolean) => (
        <Box 
            position="absolute" 
            left={{base: isUser ? "-78px" : 'auto', md: isUser ? "-166px" : 'auto' }}
            right={isUser ? 'auto' : -3}
            top={0} 
            zIndex={3}
        >
            <Popover isOpen>
                <PopoverContent w="auto">
                    <PopoverArrow />
                    <PopoverBody>
                        <Stack direction={{ base: 'column', md: 'row' }} w="full" align="center" spacing={1}>
                            <IconButton onClick={() => handleLike(msgId)} icon={<FaThumbsUp/>} aria-label={'like'}/>
                            <IconButton onClick={() => handleDislike(msgId)}  icon={<FaThumbsDown/>} aria-label={'dislike'}/>
                            <IconButton onClick={() => handleReply(msgId)} icon={<FaReply />} aria-label="reply" />
                        </Stack>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </Box>
    );

    const toggleMenu = (msgId?: any | null) => {
        if (msgId === selectedMessageId) {
            setSelectedMessageId(null);
        } else {
            setSelectedMessageId(msgId);
            setReplyTo(null);
        }
    }

    const handleOpenModal = () => {
        if (!chatroomId || chatroomId === defaultId) {
            return;
        } 
        if (chatroom.admin === user?.uid){
            onOpen();
        }
    }

    if (!chatroom) {
        return null;
    }

    return (
        <VStack w="100%" spacing={4}>
            <Heading color={"gray.500"} onClick={handleOpenModal}><Link>{chatroom.dm ? (getName(chatroom.users, user.uid)) : (chatroom.name)}</Link></Heading>
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
                    const isReplyTo = replyTo === msg.id;
                    const repliedMessage = messages.find((message) => message.id === msg.replyTo);
                    return (
                        <Flex key={msg.id} mt={3} justifyContent={isUser ? 'flex-end' : 'flex-start'}>
                            
                            <Box maxW="60%" 
                                filter={replyTo && !isReplyTo ? 'blur(4px)' : 'none'}
                                transition="filter 0.2s ease-in-out"
                            >
                                {repliedMessage && (
                                    <Box
                                        p={2}
                                        borderWidth={2}
                                        borderColor={grey}
                                        borderRadius="lg"
                                        mb={2}
                                        position="relative"
                                        _after={{
                                            content: '""',
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            width: '2px',
                                            height: isUser ? '10px' : '15px',
                                            bg: grey,
                                            transform: isUser ? 'translateX(-100%)' : 'translateX(0)',
                                        }}
                                    >
                                        <Text fontSize="sm" color={"gray.600"}>{repliedMessage.text}</Text>
                                    </Box>
                                )}
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
                                    
                                    {selectedMessageId === msg.id && renderMenu(msg.id, isUser)}
                                    
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
            <ChatroomModal isOpen={isOpen} onClose={() => {onClose(); fetchChatroom();}} chatroomId={chatroomId ? chatroomId : defaultId}/>
        </VStack>
    );
};

export default Chatroom;
