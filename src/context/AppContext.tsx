import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  orderBy,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from '../firebase';
import { FirebaseUser } from '../firebase';

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  role: 'client' | 'admin';
  followedEditors?: string[];
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface EditorProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  skills: string[];
  experience: string;
  portfolio: PortfolioItem[];
  price: number;
  profilePhoto: string;
  isApproved: boolean;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  earnings: number;
  totalWithdrawn: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  editorId: string;
  editorName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'submitted' | 'completed';
  videoUrl?: string;
  subtitleUrl?: string;
  subtitleText?: string;
  previewUrl?: string;
  thumbnailPrompt?: string;
  thumbnailPreviewUrl?: string;
  rating?: number;
  reviewText?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Withdrawal {
  id: string;
  editorId: string;
  editorName: string;
  amount: number;
  status: 'pending' | 'approved';
  requestedAt: string;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'chat' | 'payment';
  isRead: boolean;
  createdAt: string;
}

interface AppContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  editorProfile: EditorProfile | null;
  editors: EditorProfile[];
  orders: Order[];
  notifications: AppNotification[];
  withdrawals: Withdrawal[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username: string, role?: 'client' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  registerAsEditor: (profile: Omit<EditorProfile, 'uid' | 'email' | 'isApproved' | 'isVerified' | 'rating' | 'reviewsCount' | 'earnings' | 'totalWithdrawn' | 'createdAt'>) => Promise<void>;
  updateEditorProfile: (profile: Partial<EditorProfile>) => Promise<void>;
  placeOrder: (order: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], extra?: Partial<Order>) => Promise<void>;
  sendChatMessage: (chatId: string, text: string) => Promise<void>;
  followEditor: (editorId: string) => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, type: AppNotification['type']) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  submitReview: (orderId: string, rating: number, text: string) => Promise<void>;
  approveEditor: (editorId: string) => Promise<void>;
  verifyEditor: (editorId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editorProfile, setEditorProfile] = useState<EditorProfile | null>(null);
  const [editors, setEditors] = useState<EditorProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch User Profile from firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserProfile({ uid: firebaseUser.uid, ...userDocSnap.data() } as UserProfile);
        } else {
          // If profile doesn't exist (fallback), create one
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            username: firebaseUser.email?.split('@')[0] || 'user',
            email: firebaseUser.email || '',
            role: 'client',
            followedEditors: [],
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }

        // Fetch Editor profile if exists
        const editorDocRef = doc(db, 'editors', firebaseUser.uid);
        const editorDocSnap = await getDoc(editorDocRef);
        if (editorDocSnap.exists()) {
          setEditorProfile({ uid: firebaseUser.uid, ...editorDocSnap.data() } as EditorProfile);
        } else {
          setEditorProfile(null);
        }
      } else {
        setUserProfile(null);
        setEditorProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync editors, orders, notifications list
  useEffect(() => {
    const editorsQuery = collection(db, 'editors');
    const unsubEditors = onSnapshot(editorsQuery, (snapshot) => {
      const list: EditorProfile[] = [];
      snapshot.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as EditorProfile);
      });
      setEditors(list);
    });

    let unsubOrders = () => {};
    let unsubNotifications = () => {};
    let unsubWithdrawals = () => {};

    if (user) {
      // Stream orders
      const ordersQuery = collection(db, 'orders');
      unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          const orderData = d.data() as Order;
          if (orderData.clientId === user.uid || orderData.editorId === user.uid || userProfile?.role === 'admin') {
            list.push({ id: d.id, ...orderData });
          }
        });
        setOrders(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      });

      // Stream notifications
      const notifyQuery = collection(db, 'notifications');
      unsubNotifications = onSnapshot(notifyQuery, (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((d) => {
          const nData = d.data() as AppNotification;
          if (nData.userId === user.uid) {
            list.push({ id: d.id, ...nData });
          }
        });
        setNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      });

      // Stream withdrawals
      const withdrawQuery = collection(db, 'withdrawals');
      unsubWithdrawals = onSnapshot(withdrawQuery, (snapshot) => {
        const list: Withdrawal[] = [];
        snapshot.forEach((d) => {
          const wData = d.data() as Withdrawal;
          if (wData.editorId === user.uid || userProfile?.role === 'admin') {
            list.push({ id: d.id, ...wData });
          }
        });
        setWithdrawals(list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
      });
    } else {
      setOrders([]);
      setNotifications([]);
      setWithdrawals([]);
    }

    return () => {
      unsubEditors();
      unsubOrders();
      unsubNotifications();
      unsubWithdrawals();
    };
  }, [user, userProfile?.role]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string, username: string, role: 'client' | 'admin' = 'client') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const newProfile: UserProfile = {
      uid,
      name,
      username,
      email,
      role,
      followedEditors: [],
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), newProfile);
    setUserProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Editor Operations
  const registerAsEditor = async (profile: Omit<EditorProfile, 'uid' | 'email' | 'isApproved' | 'isVerified' | 'rating' | 'reviewsCount' | 'earnings' | 'totalWithdrawn' | 'createdAt'>) => {
    if (!user) throw new Error("Must be logged in to register as editor");
    const newEditor: EditorProfile = {
      ...profile,
      uid: user.uid,
      email: user.email || '',
      isApproved: false, // requires admin approval
      isVerified: false,
      rating: 5.0,
      reviewsCount: 0,
      earnings: 0,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'editors', user.uid), newEditor);
    setEditorProfile(newEditor);

    // Send notification
    await sendNotification(user.uid, "Registration Received", "Your application to join as an editor is pending admin review.", "system");
  };

  const updateEditorProfile = async (profile: Partial<EditorProfile>) => {
    if (!user) throw new Error("Must be logged in to update profile");
    const editorRef = doc(db, 'editors', user.uid);
    await updateDoc(editorRef, profile);
    if (editorProfile) {
      setEditorProfile({ ...editorProfile, ...profile });
    }
  };

  // Client Order Operations
  const placeOrder = async (orderData: Omit<Order, 'id' | 'clientId' | 'clientName' | 'status' | 'createdAt'>) => {
    if (!user || !userProfile) throw new Error("Must be logged in to place order");
    
    const newOrder: Omit<Order, 'id'> = {
      ...orderData,
      clientId: user.uid,
      clientName: userProfile.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    
    // Notify Editor
    await sendNotification(orderData.editorId, "New Order Received", `Client ${userProfile.name} placed a new order: "${orderData.title}"`, "order");
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], extra?: Partial<Order>) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status, ...extra });

    // Find the order to notify corresponding user
    const matchedOrder = orders.find(o => o.id === orderId);
    if (matchedOrder) {
      const targetUser = status === 'pending' || status === 'accepted' || status === 'rejected' || status === 'submitted'
        ? matchedOrder.clientId 
        : matchedOrder.editorId;
      
      const title = `Order Status: ${status.toUpperCase().replace('_', ' ')}`;
      const message = `Your order "${matchedOrder.title}" is now ${status.replace('_', ' ')}.`;
      await sendNotification(targetUser, title, message, "order");

      // Handle earnings update on complete
      if (status === 'completed') {
        const editorRef = doc(db, 'editors', matchedOrder.editorId);
        const edDoc = await getDoc(editorRef);
        if (edDoc.exists()) {
          const edData = edDoc.data() as EditorProfile;
          const newEarnings = (edData.earnings || 0) + matchedOrder.price;
          await updateDoc(editorRef, { earnings: newEarnings });
          await sendNotification(matchedOrder.editorId, "Earnings Updated", `₹${matchedOrder.price} has been added to your balance for completing "${matchedOrder.title}".`, "payment");
        }
      }
    }
  };

  // Chat/Messaging
  const sendChatMessage = async (chatId: string, text: string) => {
    if (!user || !userProfile) return;
    const msg: Omit<ChatMessage, 'id'> = {
      chatId,
      senderId: user.uid,
      senderName: userProfile.name,
      text,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, 'chats'), msg);
  };

  // Follow Favorite Editors
  const followEditor = async (editorId: string) => {
    if (!user || !userProfile) throw new Error("Must be logged in to follow editors");
    const userRef = doc(db, 'users', user.uid);
    const following = userProfile.followedEditors || [];
    let updated: string[];
    
    if (following.includes(editorId)) {
      updated = following.filter(id => id !== editorId);
    } else {
      updated = [...following, editorId];
      // Notify editor
      await sendNotification(editorId, "New Follower", `${userProfile.name} started following your profile!`, "system");
    }

    await updateDoc(userRef, { followedEditors: updated });
    setUserProfile({ ...userProfile, followedEditors: updated });
  };

  // Notifications
  const sendNotification = async (userId: string, title: string, message: string, type: AppNotification['type']) => {
    const newNotify: Omit<AppNotification, 'id'> = {
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'notifications'), newNotify);
  };

  // Withdrawal Requests
  const requestWithdrawal = async (amount: number) => {
    if (!user || !editorProfile) throw new Error("Must be logged in as editor");
    if (amount > editorProfile.earnings) throw new Error("Insufficient balance");

    // Deduct earnings and add to total withdrawn tentatively or fully after approval. Let's deduct immediately to lock amount.
    const newEarnings = editorProfile.earnings - amount;
    const newWithdrawn = editorProfile.totalWithdrawn + amount;
    await updateEditorProfile({ earnings: newEarnings, totalWithdrawn: newWithdrawn });

    const newWithdrawal: Omit<Withdrawal, 'id'> = {
      editorId: user.uid,
      editorName: editorProfile.name,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'withdrawals'), newWithdrawal);
    await sendNotification(user.uid, "Withdrawal Requested", `Your payout request of ₹${amount} is submitted.`, "payment");
  };

  // Submit Reviews & Ratings
  const submitReview = async (orderId: string, rating: number, text: string) => {
    const matchedOrder = orders.find(o => o.id === orderId);
    if (!matchedOrder) return;

    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { rating, reviewText: text });

    // Update editor aggregated rating
    const editorId = matchedOrder.editorId;
    const editorRef = doc(db, 'editors', editorId);
    const edDoc = await getDoc(editorRef);
    if (edDoc.exists()) {
      const edData = edDoc.data() as EditorProfile;
      const count = edData.reviewsCount || 0;
      const currentRating = edData.rating || 5.0;
      
      const newCount = count + 1;
      const newRating = Number(((currentRating * count + rating) / newCount).toFixed(1));
      
      await updateDoc(editorRef, { rating: newRating, reviewsCount: newCount });
      await sendNotification(editorId, "New Review Received", `Client left a ${rating}-star review: "${text.substring(0, 30)}..."`, "system");
    }
  };

  // Admin approvals
  const approveEditor = async (editorId: string) => {
    if (userProfile?.role !== 'admin') throw new Error("Unauthorized");
    const editorRef = doc(db, 'editors', editorId);
    await updateDoc(editorRef, { isApproved: true });
    await sendNotification(editorId, "Application Approved", "Congratulations! You have been approved as a creator on RT Editor. Clients can now hire you!", "system");
  };

  const verifyEditor = async (editorId: string) => {
    if (userProfile?.role !== 'admin') throw new Error("Unauthorized");
    const editorRef = doc(db, 'editors', editorId);
    await updateDoc(editorRef, { isVerified: true });
    await sendNotification(editorId, "Profile Verified", "Your profile has received the official Verification Badge! ⚡", "system");
  };

  return (
    <AppContext.Provider value={{
      user,
      userProfile,
      editorProfile,
      editors,
      orders,
      notifications,
      withdrawals,
      loading,
      login,
      signup,
      logout,
      registerAsEditor,
      updateEditorProfile,
      placeOrder,
      updateOrderStatus,
      sendChatMessage,
      followEditor,
      sendNotification,
      requestWithdrawal,
      submitReview,
      approveEditor,
      verifyEditor
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
