import { useAuth } from "../contexts/AuthContext";



export const getName = (users: { [key: string]: string }, userId: any): string | null => {
    for (const uid in users) {
        if (users.hasOwnProperty(uid) && uid !== userId) {
            return users[uid]; // Return the displayName of the first user that doesn't match the current user's UID
        }
    }
    return null; // Return null if no other user is found
};