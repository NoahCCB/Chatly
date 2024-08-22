// Header.tsx
import React, { useEffect } from 'react';
import { Flex, Text, IconButton, Icon, useDisclosure, Button, useBreakpointValue, Link } from '@chakra-ui/react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import ProfileModal from '../components/ProfileModal';
import { User } from '../types/User';
import SuggestionDrawer from './Suggestion';
import { ChevronRightIcon, ChevronUpIcon, HamburgerIcon } from '@chakra-ui/icons';
import Sidebar from './Sidebar';
import { updateUsersDisplayNameLower } from '../utils/api';

const Header = () => {
    const { user } = useAuth();
    const { userData } = useUser();
    const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();

    const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
    const iconButtonSize = useBreakpointValue({ base: 'sm', md: 'lg' });
    const iconDimension = useBreakpointValue({ base: '35px', md: '40px' });

    useEffect(() => {
        onSidebarClose();
    }, []);

    return (
        <>
            <Flex justifyContent="space-between" alignItems="center" w="full">
                <IconButton
                    variant = "outline"
                    icon={<HamburgerIcon />} 
                    aria-label={''}
                    onClick={onSidebarOpen}
                />
                
                <Flex alignItems="center">
                    <Button
                    size = {buttonSize}
                    colorScheme="blue"
                    onClick={onDrawerOpen}
                    aria-label={'Suggestions Button'}
                    mr={4}
                    >
                        Suggestions
                    </Button>
                    <IconButton
                        icon={<Icon w={iconDimension} h={iconDimension} as={FaUserCircle} />}
                        size = {iconButtonSize}
                        isRound
                        p={0}
                        colorScheme="gray"
                        bg={userData?.profileColor || '#8edafa'}
                        onClick={onProfileOpen}
                        aria-label={'Profile Button'}
                    />
                </Flex>
            </Flex>
            <ProfileModal isOpen={isProfileOpen} onClose={onProfileClose} user={user as User} />
            <SuggestionDrawer isOpen={isDrawerOpen} onClose={onDrawerClose} />
            <Sidebar isOpen={isSidebarOpen} onClose={onSidebarClose} />
        </>
    );
};

export default Header;
