// LeftDrawer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Button, useToast, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Switch, Text, ModalFooter, VStack, Divider, HStack, InputGroup, InputLeftElement, Menu, MenuItem, MenuList, Portal, Box, MenuOptionGroup, MenuDivider, StackDivider } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, startAt, where } from 'firebase/firestore';
import { db } from '../firebase';
import { AddIcon, Search2Icon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import Profile from './profile';

const Sidebar = ({ isOpen, onClose }: any) => {
    const toast = useToast();
    const { user } = useAuth();
    const { userData } = useUser();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

    const [chatroomName, setChatroomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [chatrooms, setChatrooms] = useState<any[]>([]);
    const [directMessages, setDirectMessages] = useState<any[]>([]);
    const [searchResultsUsers, setSearchResultsUsers] = useState<any[]>([]);
    const [searchResultsChatrooms, setSearchResultsChatrooms] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedUid, setSelectedUid] = useState<any>(null);

    const fetchChatrooms = async () => {
        try {
            const chatroomsRef = collection(db, 'chatrooms');
            const q = query(chatroomsRef, where('dm', '==', false));
            const querySnapshot = await getDocs(q);
            const fetchedChatrooms = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((chatroom: any) => chatroom.users && chatroom.users.hasOwnProperty(user?.uid));
            console.log("Chatrooms", fetchedChatrooms);
            // Sort chatrooms with admin ones at the top
            fetchedChatrooms.sort((a: any, b: any) => (a.admin === user?.uid ? -1 : 1));
            setChatrooms(fetchedChatrooms);
        } catch (e) {
            console.error("Error fetching chatrooms: ", e);
        }
    };

    const fetchDirectMessages = async () => {
        try {
            const chatroomsRef = collection(db, 'chatrooms');
            const q = query(chatroomsRef, where('dm', '==', true));
            const querySnapshot = await getDocs(q);
            const fetchedChatrooms = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((chatroom: any) => chatroom.users && chatroom.users.hasOwnProperty(user?.uid));
            console.log("user uid", user?.uid);
            console.log("querySnaphsot", querySnapshot);
            console.log("DMs", fetchedChatrooms);
            // Sort chatrooms with admin ones at the top
            fetchedChatrooms.sort((a: any, b: any) => (a.admin === user?.uid ? -1 : 1));
            setDirectMessages(fetchedChatrooms);
        } catch (e) {
            console.error("Error fetching chatrooms: ", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchChatrooms();
            fetchDirectMessages();
        }
    }, [isOpen]);

    const createChatroom = async () => {
        try {
            if (!user?.uid || !user?.displayName) {
                return;
            }
            const chatroomRef = await addDoc(collection(db, 'chatrooms'), {
                name: chatroomName, // You might want to prompt the user for a name
                users: {
                    [user?.uid]: userData?.displayName
                },
                createdAt: serverTimestamp(),
                image: null,
                totalUsers: 1,
                private: isPrivate,
                admin: user?.uid,
                dm: false
            });
            toast({
                title: "Chatroom created.",
                description: `Chatroom ID: ${chatroomRef.id}`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onModalClose();
            setChatroomName('');
            setIsPrivate(false);
            fetchChatrooms();
        } catch (e) {
            console.error("Error adding chatroom: ", e);
            toast({
                title: "Error creating chatroom.",
                description: "An error occurred while creating the chatroom.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleChatroomClick = (chatroomId: string) => {
        navigate(`/chatroom/${chatroomId}`);
    };

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsMenuOpen(true);
        const queryText = e.target.value;
        setSearchQuery(queryText);

        if (queryText.trim() === '') {
            setSearchResultsUsers([]);
            setSearchResultsChatrooms([]);
            return;
        }

        try {
            console.log("looking");
            const usersRef = collection(db, 'users');
            const usersQuery = query(usersRef, orderBy('displayName'), startAt(queryText), limit(5));
            const usersSnapshot = await getDocs(usersQuery);
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(users);
            // Search public chatrooms
            const chatroomsRef = collection(db, 'chatrooms');
            const chatroomsQuery = query(chatroomsRef, where('private', '==', false), orderBy('name'), startAt(queryText), limit(5));
            const chatroomsSnapshot = await getDocs(chatroomsQuery);
            const chatrooms = chatroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(chatrooms)
            setSearchResultsUsers(users);
            setSearchResultsChatrooms(chatrooms);
        } catch (e) {
            console.error("Error searching: ", e);
        }
    };

    const keepFocusOnInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsMenuOpen(false);
        }
    };

    const getName = (users: { [key: string]: string }): string | null => {
        for (const uid in users) {
            if (users.hasOwnProperty(uid) && uid !== user?.uid) {
                return users[uid]; // Return the displayName of the first user that doesn't match the current user's UID
            }
        }
        return null; // Return null if no other user is found
    };
    
    return (
        <>
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                    <HStack spacing={4}>
                        <Text>Chatly</Text>
                        <IconButton
                            size="sm"
                            icon={<AddIcon />}
                            aria-label="Create Chatroom"
                            onClick={onModalOpen}
                            colorScheme="blue"
                        />
                    </HStack>
                </DrawerHeader>
                <DrawerBody>
                    <Divider />
                    <Box position={"relative"} onBlur={handleBlur} onFocus={() => setIsMenuOpen(true)}>
                        <InputGroup mt={3} mb={3}>
                            <InputLeftElement pointerEvents='none'>
                                <Search2Icon color='gray.300' />
                            </InputLeftElement>
                            <Input 
                                ref={inputRef}
                                placeholder='Search users and rooms...' 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onBlur={() => {keepFocusOnInput();}}
                            />
                        </InputGroup>
                        <Box position="absolute" bottom={0} w="full">
                            {isMenuOpen && (searchResultsUsers.length > 0 || searchResultsChatrooms.length > 0) && (
                                <Menu isOpen>
                                    <MenuList minW="272px">
                                        <MenuOptionGroup title="Users">
                                        {searchResultsUsers.map((result, index) => (
                                            <MenuItem
                                                key={index}
                                                w="full"
                                                onClick={() => {setSelectedUid(result.id)}}
                                            >
                                                <Text>{result?.displayName}</Text>
                                            </MenuItem>
                                        ))}
                                        </MenuOptionGroup>
                                        <MenuDivider/>
                                        <MenuOptionGroup title="Chatrooms">
                                        {searchResultsChatrooms.map((result, index) => (
                                            <MenuItem
                                                key={index}
                                                w="full"
                                                onClick={() => {}}
                                            >
                                                <Text>{result?.name}</Text>
                                            </MenuItem>
                                        ))}
                                        </MenuOptionGroup>
                                    </MenuList>
                                </Menu>
                            )}
                        </Box>
                    </Box>
                    <VStack spacing={4} align="stretch">
                        <Text fontWeight={"bold"}>Chatrooms</Text>
                        {chatrooms.map(chatroom => (
                            <Button key={chatroom.id} w="full" justifyContent="flex-start" onClick={() => {handleChatroomClick(chatroom.id);}}>
                                <Text>{chatroom.name} {chatroom.admin === user?.uid && "(Admin)"}</Text>
                            </Button>
                        ))}
                    </VStack>
                    <Divider my={5}/>
                    <VStack spacing={4} align="stretch">
                        <Text fontWeight={"bold"}>Direct Messages</Text>
                        {directMessages.map(dm => {
                            
                            return (
                                <Button key={dm.id} w="full" justifyContent="flex-start" onClick={() => {handleChatroomClick(dm.id);}}>
                                    <Text>{getName(dm.users)}</Text>
                                </Button>
                            )
                        })}
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
        <Modal isOpen={isModalOpen} onClose={onModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create a New Chatroom</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Chatroom Name</FormLabel>
                            <Input
                                value={chatroomName}
                                onChange={(e) => setChatroomName(e.target.value)}
                                placeholder="Enter chatroom name"
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center" mt={4}>
                            <FormLabel htmlFor="private-switch" mb="0">
                                Private Chatroom
                            </FormLabel>
                            <Switch
                                id="private-switch"
                                isChecked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={createChatroom}>
                            Create
                        </Button>
                        <Button variant="ghost" onClick={onModalClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Profile uid={selectedUid}/>
            </>
    );
};

export default Sidebar;
