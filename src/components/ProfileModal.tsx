import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    useDisclosure,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useUser } from '../contexts/UserContext';
import ColorPicker from './ColorPicker';

const ProfileModal = ({ isOpen, onClose, user }: any) => {
    const { userData, setUserData } = useUser();
    const [username, setUsername] = useState(user?.displayName || '');
    const [error, setError] = useState('');
    const [profileColor, setProfileColor] = useState(user?.displayName || '#808080'); // Default to gray

    const handleSave = async () => {
        if (username !== userData?.displayName) {
            const usernameQuery = query(collection(db, 'users'), where('displayNameLower', '==', username.toLowerCase()));
            const querySnapshot = await getDocs(usernameQuery);

            if (!querySnapshot.empty) {
                setError('Username is already taken. Please choose another one.');
                return;
            }
        }
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
            displayName: username,
            profileColor,
        });
        setUserData({ ...userData, displayName: username, profileColor });
        onClose();
    };

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            onClose();
        });
    };

    useEffect(() => {
        if (isOpen) {
            setProfileColor(userData?.profileColor);
            setUsername(userData?.displayName);
            setError('');
        }
    }, [isOpen, userData]);

    const handleClose = () => {
        setProfileColor(userData?.profileColor);
        setUsername(userData?.displayName);
        setError('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {error && (
                        <Alert status="error">
                        <AlertIcon />
                        {error}
                        </Alert>
                    )}
                    <FormControl id="username">
                        <FormLabel>Username</FormLabel>
                        <Input
                            value={username}
                            onChange={(e) => {setUsername(e.target.value); setError('');}}
                        />
                    </FormControl>
                    <FormControl id="color" mt={5}>
                        <ColorPicker color={profileColor} setColor={setProfileColor}/>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={handleLogout}>
                        Logout
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ProfileModal;
