import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Adjust the path as per your project structure
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Define types for context
type UserContextType = {
    userData: any;
    setUserData: React.Dispatch<React.SetStateAction<any>>;
};

// Create UserContext with initial undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// UserProvider component to provide UserContext to the app
export const UserProvider: any = ({ children }: any) => {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserData(userData);
                }
            } else {
                setUserData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const userContextValue: UserContextType = {
        userData,
        setUserData,
    };

    return <UserContext.Provider value={userContextValue}>{children}</UserContext.Provider>;
};

export default UserContext;
