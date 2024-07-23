import { collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure to import your Firestore instance

const updateUsersDisplayNameLower = async () => {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    const batch = writeBatch(db);;

    usersSnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const userDocRef = doc(db, 'users', docSnapshot.id);

        // Ensure displayName exists before attempting to convert to lowercase
        if (data.displayName) {
            batch.update(userDocRef, {
                displayNameLower: data.displayName.toLowerCase(),
            });
        }
    });

    await batch.commit();
    console.log('Users updated with lowercase displayName.');
};

// Run the update function
updateUsersDisplayNameLower().catch(console.error);
