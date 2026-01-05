'use client';

import { doc, setDoc, collection, addDoc, getDoc, updateDoc, increment, query, where, getDocs, orderBy, limit, runTransaction, deleteDoc, writeBatch, startAfter } from "firebase/firestore";
import { db } from "./firebase";

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  habit: string;
  joinedAt: string; // ISO string
  completedCount: number;
}

export interface PostData {
  id: string; // Added for when fetched from firestore
  authorId: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string; // ISO string
  approved: boolean;
  commentCount: number; // Added to store comment count
  authorName?: string; // Will be added client-side
  comments?: CommentData[]; // Will be added client-side
}

export interface CommentData {
  id: string; // Added for when fetched from firestore
  authorId: string;
  content: string;
  createdAt: string; // ISO string
  authorName?: string; // Will be added client-side
}

// Get a user from the `users` collection
export async function getUser(uid: string): Promise<UserData | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserData) : null;
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
    approved: false,
    commentCount: 0, // Initialize comment count
  });
}

// Add a comment to the `comments` subcollection of a post
export async function addComment(postId: string, comment: {
  authorId: string;
  content: string;
}) {
  const postRef = doc(db, "posts", postId);
  const commentsRef = collection(db, `posts/${postId}/comments`);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Add the new comment
      const newCommentRef = doc(commentsRef);
      transaction.set(newCommentRef, {
        authorId: comment.authorId,
        content: comment.content,
        createdAt: new Date().toISOString(),
      });

      // 2. Update the comment count on the post
      transaction.update(postRef, {
        commentCount: increment(1),
      });
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
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

export async function getPosts(startAfterDoc?: any): Promise<{ posts: PostData[], lastVisible: any }> {
  const postsRef = collection(db, "posts");
  const postsLimit = 9;

  let q;
  if (startAfterDoc) {
    q = query(postsRef, orderBy("createdAt", "desc"), startAfter(startAfterDoc), limit(postsLimit));
  } else {
    q = query(postsRef, orderBy("createdAt", "desc"), limit(postsLimit));
  }

  const querySnapshot = await getDocs(q);

  const posts = querySnapshot.docs.map(doc => {
    const data = doc.data() as PostData;
    return {
      ...data,
id: doc.id,
      commentCount: data.commentCount || 0,
    };
  });

  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  return { posts, lastVisible };
}



// Get all comments for a post

export async function getComments(postId: string): Promise<CommentData[]> {

  const commentsRef = collection(db, `posts/${postId}/comments`);

  const q = query(commentsRef, orderBy("createdAt", "asc"));

  const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({ ...doc.data() as CommentData, id: doc.id }));

      }

    

      // Get all users sorted by completedCount for leaderboard

      export async function getUsersSortedByCompletedCount(): Promise<UserData[]> {

        const usersRef = collection(db, "users");

        const q = query(usersRef, orderBy("completedCount", "desc"));

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({ ...doc.data() as UserData, uid: doc.id }));

      }

      

      // Delete a post and all its comments

  export async function deletePost(postId: string) {

    const postRef = doc(db, "posts", postId);

    const commentsRef = collection(db, `posts/${postId}/comments`);

  

    // Delete all comments in the subcollection

    const commentsSnapshot = await getDocs(commentsRef);

    const batch = writeBatch(db);

    commentsSnapshot.forEach(doc => {

      batch.delete(doc.ref);

    });

    await batch.commit();

  

    // Delete the post itself

    await deleteDoc(postRef);

  }

  

    // Delete a comment and decrement the post's commentCount

  

    export async function deleteComment(postId: string, commentId: string) {

  

      const postRef = doc(db, "posts", postId);

  

      const commentRef = doc(db, `posts/${postId}/comments`, commentId);

  

  

  

      try {

  

        await runTransaction(db, async (transaction) => {

  

          // 1. Delete the comment

  

          transaction.delete(commentRef);

  

  

  

          // 2. Decrement the comment count on the post

  

          transaction.update(postRef, {

  

            commentCount: increment(-1),

  

          });

  

        });

  

      } catch (error) {

  

        console.error("Transaction failed: ", error);

  

        throw error;

  

      }

  

    }

  

  

  

    // Update a user's habit

  

      export async function updateUserHabit(uid: string, newHabit: string) {

  

        const userRef = doc(db, "users", uid);

  

        await updateDoc(userRef, {

  

          habit: newHabit,

  

        });

  

      }

  

    

  

            

  
