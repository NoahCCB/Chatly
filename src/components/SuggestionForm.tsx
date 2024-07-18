import React, { useState } from 'react';
import { Box, Textarea, Button, VStack } from '@chakra-ui/react';
import { db } from '../firebase'; // Import your Firebase instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const SuggestionForm = () => {
    const { user } = useAuth();
    const [suggestion, setSuggestion] = useState('');

    const handleSubmit = async () => {
        if (suggestion.trim()) {
            await addDoc(collection(db, 'suggestions'), {
                text: suggestion,
                votes: 0,
                upvotes: [],
                downvotes: [],
                timestamp: serverTimestamp(),
                uid: user?.uid,
            });
            setSuggestion('');
        }
    };

    return (
        <VStack w="full" spacing={4} align="stretch">
            <Textarea
                placeholder="Type your suggestion here..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows={4}
            />
            <Button colorScheme="blue" onClick={handleSubmit}>
                Submit Suggestion
            </Button>
        </VStack>
    );
};

export default SuggestionForm;
