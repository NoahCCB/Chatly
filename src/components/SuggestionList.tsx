import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, VStack, HStack, IconButton } from '@chakra-ui/react';
import { db } from '../firebase'; // Import your Firebase instance
import { collection, onSnapshot, doc, updateDoc, orderBy, query, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'; // Import your Auth context
import { CloseIcon } from '@chakra-ui/icons';

const SuggestionList = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const topOfSuggestionsRef = useRef<any>(null);

    useEffect(() => {
        // Scroll to bottom of messages when they update
        if (topOfSuggestionsRef.current) {
            topOfSuggestionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [suggestions]);

    useEffect(() => {
        const q = query(collection(db, 'suggestions'), orderBy('votes', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const suggestionsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSuggestions(suggestionsData);
        });
        return () => unsubscribe();
    }, []);

    const handleVote = async (id: any, type: any) => {
        if (!user) return;

        const suggestionRef = doc(db, 'suggestions', id);
        const suggestionDoc = await getDoc(suggestionRef);
        const suggestionData = suggestionDoc.data();

        if (suggestionData) {
            const userId = user.uid;
            let newVotes = suggestionData.votes;
            const upvotes = suggestionData.upvotes || [];
            const downvotes = suggestionData.downvotes || [];

            if (type === 'upvote') {
                if (downvotes.includes(userId)) {
                    newVotes += 2; // Removing a downvote and adding an upvote
                    await updateDoc(suggestionRef, {
                        votes: newVotes,
                        upvotes: arrayUnion(userId),
                        downvotes: arrayRemove(userId)
                    });
                } else if (!upvotes.includes(userId)) {
                    newVotes += 1; // Adding an upvote
                    await updateDoc(suggestionRef, {
                        votes: newVotes,
                        upvotes: arrayUnion(userId)
                    });
                } else {
                    newVotes -= 1;
                    await updateDoc(suggestionRef, {
                        votes: newVotes,
                        upvotes: arrayRemove(userId)
                    });
                }
            } else if (type === 'downvote') {
                if (upvotes.includes(userId)) {
                    newVotes -= 2; // Removing an upvote and adding a downvote
                    await updateDoc(suggestionRef, {
                        votes: newVotes,
                        upvotes: arrayRemove(userId),
                        downvotes: arrayUnion(userId)
                    });
                } else if (!downvotes.includes(userId)) {
                    newVotes -= 1; // Adding a downvote
                    await updateDoc(suggestionRef, {
                        votes: newVotes,
                        downvotes: arrayUnion(userId)
                    });
                } else {
                    newVotes += 1;
                    await updateDoc(suggestionRef, {
                        votes: newVotes,
                        downvotes: arrayRemove(userId)
                    });
                }
            }
        }
    };

    const handleDelete = async (id: any) => {
        if (!user) return;
        const suggestionRef = doc(db, 'suggestions', id);
        await deleteDoc(suggestionRef);
    };

    return (
        <VStack 
            w="full"
            spacing={4} 
            align="stretch"
            height="400"
            overflowY="auto"
            bg="gray.100"
            borderRadius={"md"}
            p={2}
        >
            <div ref={topOfSuggestionsRef} />
            {suggestions.map((suggestion) => (
                <Box key={suggestion.id} p={4} borderWidth={1} borderRadius="md" bg="white" position="relative">
                    <Text mr={5}>{suggestion.text}</Text>
                    <HStack justify="space-between" mt={2}>
                        <Text>Votes: {suggestion.votes}</Text>
                        {suggestion.uid === user?.uid && (
                            <IconButton
                                icon={<CloseIcon />}
                                aria-label="Delete Suggestion"
                                colorScheme="red"
                                size="xs"
                                onClick={() => handleDelete(suggestion.id)}
                                position="absolute"
                                top={2}
                                right={2}
                            />
                        )}
                        <HStack>
                            <IconButton
                                icon={<FaThumbsUp />}
                                aria-label="Upvote"
                                colorScheme={suggestion.upvotes.includes(user?.uid) ? 'green' : 'gray'}
                                onClick={() => handleVote(suggestion.id, 'upvote')}
                            />
                            <IconButton
                                icon={<FaThumbsDown />}
                                aria-label="Downvote"
                                colorScheme={suggestion.downvotes.includes(user?.uid) ? 'red' : 'gray'}
                                onClick={() => handleVote(suggestion.id, 'downvote')}
                            />
                        </HStack>
                    </HStack>
                </Box>
            ))}
        </VStack>
    );
};

export default SuggestionList;
