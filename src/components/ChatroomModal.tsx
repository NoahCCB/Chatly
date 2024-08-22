import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  useDisclosure,
  Box,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
} from '@chakra-ui/react';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAt, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import { Search2Icon } from '@chakra-ui/icons';

const ChatroomModal = ({ isOpen, onClose, chatroomId }: any) => {
    //const { chatroomId }: any = useParams();
    const [chatroomName, setChatroomName] = useState('');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any>({});
    const [searchResultsUsers, setSearchResultsUsers] = useState<any[]>([]);
    const [searchResultsChatrooms, setSearchResultsChatrooms] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchChatroomData = async () => {
            const chatroomDoc = await getDoc(doc(db, 'chatrooms', chatroomId));
            if (chatroomDoc.exists()) {
                const data = chatroomDoc.data();
                setChatroomName(data.name);
                setUsers(data.users);
                console.log("chatroom: ", data);
            }
        };

        if (chatroomId) {
            fetchChatroomData();
        }
    }, [chatroomId]);

  const handleSave = async () => {
    if (!chatroomId) return;
    try {
      await updateDoc(doc(db, 'chatrooms', chatroomId), {
        name: chatroomName,
        nameLower: chatroomName.toLowerCase(),
      });
      onClose();
    } catch (error) {
      console.error('Error updating chatroom:', error);
    }
  };

  const handleAddUser = async (uid: any, displayName: any) => {
    console.log("adding", uid, displayName);
    if (!chatroomId || !uid) return;
    try {
      await updateDoc(doc(db, 'chatrooms', chatroomId), {
        [`users.${uid}`]: displayName,
      });
      setUsers((prevUsers: any) => ({ ...prevUsers, [uid]: displayName }));
    } catch (error) {
      console.error('Error adding user to chatroom:', error);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMenuOpen(true);
    const queryText = e.target.value;
    setSearchQuery(queryText);

    if (queryText.trim() === '') {
        setSearchResultsUsers([]);
        return;
    }

    try {
        console.log("looking");
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, orderBy('displayNameLower'), startAt(queryText.toLowerCase()), limit(5));
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        console.log(users);
        setSearchResultsUsers(users);
    } catch (e) {
        console.error("Error searching: ", e);
    }
    };

    const filteredUsers = Object.keys(users).filter((uid) =>
        users[uid].toLowerCase().includes(search.toLowerCase())
    );

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsMenuOpen(false);
        }
    };

    const filteredSearchResults = searchResultsUsers.filter(
        (result) => !users[result.id]
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chatroom</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            <VStack spacing={4}>
            <Box position={"relative"} onBlur={handleBlur} onFocus={() => setIsMenuOpen(true)} w="full">
                <InputGroup mt={3} mb={3}>
                    <InputLeftElement pointerEvents='none'>
                        <Search2Icon color='gray.300' />
                    </InputLeftElement>
                    <Input 
                        ref={inputRef}
                        placeholder='Search users...' 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onBlur={() => {}}
                    />
                </InputGroup>
                <Box position="absolute" bottom={0} w="full">
                    {isMenuOpen && (searchResultsUsers.length > 0 || searchResultsChatrooms.length > 0) && (
                        <Menu isOpen>
                            <MenuList minW="400px">
                            {filteredSearchResults.map((result, index) => (
                                <MenuItem
                                    key={index}
                                    w="full"
                                    onClick={() => {}}
                                    justifyContent="space-between"
                                >
                                    <Text>{result?.displayName}</Text>
                                    
                                    <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => handleAddUser(result.id, result.displayName)}
                                    >Add</Button>
                                </MenuItem>
                            ))}
                            </MenuList>
                        </Menu>
                    )}
                </Box>
            </Box>
            <FormControl>
              <FormLabel>Chatroom Name</FormLabel>
              <Input
                value={chatroomName}
                onChange={(e) => setChatroomName(e.target.value)}
              />
            </FormControl>
            <Box w="100%">
              
                <Menu>
                    <MenuButton as={Button}>Users</MenuButton>
                    <MenuList>
                        {filteredUsers.map((uid) => (
                            <MenuItem>{users[uid]}</MenuItem>
                        ))}
                    </MenuList>
                </Menu>
               
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChatroomModal;

{/* <FormLabel>Users</FormLabel>
<Input
placeholder="Search users..."
value={search}
onChange={(e) => setSearch(e.target.value)}
/> */}