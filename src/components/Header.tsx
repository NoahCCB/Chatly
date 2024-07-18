// Header.tsx
import React from 'react';
import { Flex, Text, IconButton, Icon, useDisclosure, Button } from '@chakra-ui/react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import ProfileModal from '../components/ProfileModal';
import { User } from '../types/User';
import SuggestionDrawer from './Suggestion';

const Header = () => {
    const { user } = useAuth();
    const { userData } = useUser();
    const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

    return (
        <>
            <Flex justifyContent="space-between" alignItems="center" w="full">
                <Text fontSize="2xl">Chatly</Text>
                <Flex alignItems="center">
                    <Button
                    colorScheme="blue"
                    onClick={onDrawerOpen}
                    aria-label={'Suggestions Button'}
                    mr={4}
                    >
                        Suggestions
                    </Button>
                    <IconButton
                        icon={<Icon w={8} h={8} as={FaUserCircle} />}
                        size="lg"
                        isRound
                        colorScheme="gray"
                        bg={userData?.profileColor || 'gray'}
                        onClick={onProfileOpen}
                        aria-label={'Profile Button'}
                    />
                </Flex>
            </Flex>
            <ProfileModal isOpen={isProfileOpen} onClose={onProfileClose} user={user as User} />
            <SuggestionDrawer isOpen={isDrawerOpen} onClose={onDrawerClose} />
        </>
    );
};

export default Header;
