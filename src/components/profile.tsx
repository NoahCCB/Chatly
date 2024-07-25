import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
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

interface ProfileProps {
  uid: string | null;
}

const Profile: React.FC<ProfileProps> = ({ uid }: any) => {
  const { user } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!uid);

  useEffect(() => {
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

    fetchUserProfile();
  }, [uid]);

  useEffect(() => {
    setIsModalOpen(!!uid);
  }, [uid]);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleMessageClick =  async () => {
    try {
      if (!user?.uid || !user?.displayName) {
          return;
      }
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
          dm: true
      });
      navigate(`/chatroom/${chatroomRef.id}`);
      setIsModalOpen(false);
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
          <Button colorScheme="blue" onClick={handleMessageClick}>
            Message
          </Button>
          <Button variant="ghost" ml={3} onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Profile;
