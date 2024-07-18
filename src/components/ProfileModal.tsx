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
    useDisclosure
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useUser } from '../contexts/UserContext';
import ColorPicker from './ColorPicker';

const ProfileModal = ({ isOpen, onClose, user }: any) => {
    const { userData, setUserData } = useUser();
    const [username, setUsername] = useState(user?.displayName || '');
    const [profileColor, setProfileColor] = useState(user?.displayName || '#808080'); // Default to gray

    const handleSave = async () => {
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
            displayName: username,
            profileColor,
        });
        setUserData({ ...userData, profileColor });
        onClose();
    };

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            onClose();
        });
    };

    useEffect(() => {
        setProfileColor(userData?.profileColor);
    }, [userData])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl id="username">
                        <FormLabel>Username</FormLabel>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
