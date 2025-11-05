'use client';

import { doc, setDoc, collection, addDoc, getDoc, updateDoc, increment, query, where, getDocs, orderBy, limit, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

// Helper function to check for consecutive days
function isConsecutiveDay(lastDate?: string): boolean {
  if (!lastDate) return false;
  
  const today = new Date();
  const last = new Date(lastDate);
  // Normalize dates to midnight to compare days accurately
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - last.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

// Get a user from the `users` collection
export async function getUser(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

// Add a user to the `users` collection
export async function addUser(user: {
  uid: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  habit: string;
  goalCount?: number;
}) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    name: user.name,
    email: user.email,
    role: user.role,
    habit: user.habit,
    goalCount: user.goalCount || 30,
    joinedAt: new Date().toISOString(),
    // Initialize progress fields
    completedCount: 0,
    streakDays: 0,
    lastCompletedDate: null,
  });
}

// Add a post to the `posts` collection
export async function addPost(post: {
  authorId: string;
  title: string;
  content: string;
}) {
  const postsRef = collection(db, "posts");
  await addDoc(postsRef, {
    authorId: post.authorId,
    title: post.title,
    content: post.content,
    createdAt: new Date().toISOString(),
    approved: false, // Add approved field
  });
}

// Add a comment to the `comments` subcollection of a post
export async function addComment(postId: string, comment: {
  authorId: string;
  content: string;
}) {
  const commentsRef = collection(db, `posts/${postId}/comments`);
  await addDoc(commentsRef, {
    authorId: comment.authorId,
    content: comment.content,
    createdAt: new Date().toISOString(),
  });
}

// Approve a post and update user's progress
export async function approvePostAndUpdateProgress(postId: string, studentId: string) {
  const postRef = doc(db, "posts", postId);
  const userRef = doc(db, "users", studentId);
  const today = new Date().toISOString().split('T')[0];

  try {
    await runTransaction(db, async (transaction) => {
      const [postDoc, userDoc] = await Promise.all([
        transaction.get(postRef),
        transaction.get(userRef)
      ]);

      if (!postDoc.exists() || postDoc.data().approved) {
        throw new Error("Post does not exist or has already been approved.");
      }
      if (!userDoc.exists()) {
        throw new Error("Student does not exist.");
      }

      const userData = userDoc.data();
      // Prevent multiple completions on the same day by the same student
      if (userData.lastCompletedDate === today) {
        // Silently ignore or throw error? For now, just update the post.
        transaction.update(postRef, { approved: true });
        return; 
      }

      // 1. Update the post to be approved
      transaction.update(postRef, { approved: true });

      // 2. Update the user's progress
      const isStreak = isConsecutiveDay(userData.lastCompletedDate);
      transaction.update(userRef, {
        completedCount: increment(1),
        streakDays: isStreak ? increment(1) : 1,
        lastCompletedDate: today
      });
    });
    console.log("Transaction successfully committed!");
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}