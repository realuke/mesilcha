'use client';

import { doc, setDoc, collection, addDoc, getDoc, updateDoc, increment, query, where, getDocs, orderBy, limit } from "firebase/firestore";
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
  role: "students" | "teacher";
  habit: string;
  goalCount?: number;
}) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    name: user.name,
    email: user.email,
    role: user.role,
    habit: user.habit,
    goalCount: user.goalCount || 0,
    joinedAt: new Date().toISOString(),
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