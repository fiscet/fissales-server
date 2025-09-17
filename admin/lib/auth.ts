import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserRole {
  uid: string;
  email: string;
  role: 'admin' | 'viewer' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
}

// Check if user has admin role
export const isAdmin = async (user: User): Promise<boolean> => {
  try {
    const userRoleDoc = await getDoc(doc(db, 'user_roles', user.uid));
    if (!userRoleDoc.exists()) {
      return false;
    }

    const userData = userRoleDoc.data() as UserRole;
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

// Create user role (default: pending)
export const createUserRole = async (user: User): Promise<void> => {
  try {
    const userRole: UserRole = {
      uid: user.uid,
      email: user.email || '',
      role: 'pending', // Default to pending approval
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'user_roles', user.uid), userRole);
  } catch (error) {
    console.error('Error creating user role:', error);
    throw error;
  }
};

// Get user role
export const getUserRole = async (user: User): Promise<UserRole | null> => {
  try {
    const userRoleDoc = await getDoc(doc(db, 'user_roles', user.uid));
    if (!userRoleDoc.exists()) {
      return null;
    }

    return userRoleDoc.data() as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Predefined admin emails (first line of defense)
const ADMIN_EMAILS = [
  'fiscet@gmail.com',
  // Add your admin emails here
];

export const isPreApprovedAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
