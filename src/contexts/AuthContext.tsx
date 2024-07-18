import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Adjust the path as per your project structure
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../types/User';
import { doc, getDoc } from 'firebase/firestore';

// Define types for context
type AuthContextType = {
  user: User | null; // Firebase User object or null
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Function to update user state
};

// Create AuthContext with initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component to provide AuthContext to the app
export const AuthProvider: any = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({ ...currentUser, profileColor: userData.profileColor });
        } else {
            setUser(currentUser as User);
        }
      }
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const authContextValue: AuthContextType = {
    user,
    setUser,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
