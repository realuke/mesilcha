'use client';

import { doc, setDoc, collection, addDoc, getDoc, updateDoc, increment, query, where, getDocs, orderBy, limit, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

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
}) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    name: user.name,
    email: user.email,
    role: user.role,
    habit: user.habit,
    joinedAt: new Date().toISOString(),
    // Initialize progress fields
    completedCount: 0,
  });
}

// Add a post to the `posts` collection
export async function addPost(post: {
  authorId: string;
  title:string;
  content: string;
  imageUrl?: string;
}) {
  const postsRef = collection(db, "posts");
  await addDoc(postsRef, {
    authorId: post.authorId,
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl || null,
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

  try {
    await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists() || postDoc.data().approved) {
        throw new Error("Post does not exist or has already been approved.");
      }
      
      // 1. Update the post to be approved
      transaction.update(postRef, { approved: true });

      // 2. Update the user's progress
      transaction.update(userRef, {
        completedCount: increment(1),
      });
    });
    console.log("Transaction successfully committed!");
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}

// Get all posts from the `posts` collection
export async function getPosts() {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}