'use client';

import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    // 쿠키에 토큰 저장 (7일 유효)
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    // 쿠키 삭제
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  } catch (error) {
    throw error;
  }
};

export const onAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };