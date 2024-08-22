import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import to your Firebase configuration file
import {
  Box,
  Button,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { userScripts } from 'webextension-polyfill';


const Profile = ({ uid, setUid }: any) => {
  const { user } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!uid);

  const fetchUserProfile = async () => {
    setLoading(true);
    if (uid) {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          console.error('No such user!');
        }
      } catch (e) {
        console.error('Error fetching user profile: ', e);
      } finally {
        setLoading(false);
      }
    } else {
      setUserProfile(null); // Reset profile if uid is null
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    setIsModalOpen(!!uid);
  }, [uid]);

  const handleClose = () => {
    setIsModalOpen(false);
    setUid(null);
  };

  const handleMessageClick =  async () => {
    try {
      if (!user?.uid || !user?.displayName) {
          return;
      }

      const dmQuery = query(
        collection(db, 'chatrooms'),
        where('dm', '==', true),
        where(`users.${user.uid}`, '==', user.displayName),
        where(`users.${uid}`, '==', userProfile.displayName)
      );

      const dmChatrooms = await getDocs(dmQuery);
      
      if (!dmChatrooms.empty) {
        // Navigate to the existing DM chatroom
        const existingChatroomId = dmChatrooms.docs[0].id;
        navigate(`/chatroom/${existingChatroomId}`);
      } else {
        const chatroomRef = await addDoc(collection(db, 'chatrooms'), {
            name: ``, // You might want to prompt the user for a name
            users: {
                [user?.uid]: userData?.displayName,
                [uid]: userProfile.displayName
            },
            createdAt: serverTimestamp(),
            image: null,
            totalUsers: 2,
            private: true,
            admin: user?.uid,
            dm: true,
            active: true
        });
        navigate(`/chatroom/${chatroomRef.id}`);
      }
      handleClose();
    } catch (e) {
        console.error("Error adding chatroom: ", e);
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Profile</ModalHeader>
        <ModalBody>
          {loading ? (
            <Spinner size="xl" />
          ) : userProfile ? (
            <Box p={5}>
              <Text fontSize="2xl" mb={4}>{userProfile.displayName}</Text>
            </Box>
          ) : (
            <Text>No such user found.</Text>
          )}
        </ModalBody>
        <ModalFooter>
          {(uid === user?.uid) ? (
            <></>
          ) : (
            <Button colorScheme="blue" onClick={handleMessageClick}>
            Message
            </Button>
          )}
          <Button variant="ghost" ml={3} onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Profile;
