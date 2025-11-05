'use client';

import { doc, getDoc, updateDoc, increment, query, collection, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProgress {
  streakDays: number;
  goalCount: number;
  completedCount: number;
  lastCompletedDate?: string;
}

// 사용자의 진행 상황을 가져오는 함수
export async function getUserProgress(uid: string): Promise<UserProgress> {
  const progressRef = doc(db, "userProgress", uid);
  const progressSnap = await getDoc(progressRef);
  
  if (!progressSnap.exists()) {
    // 초기 진행 상황 생성
    const initialProgress: UserProgress = {
      streakDays: 0,
      goalCount: 30, // 기본 목표 수
      completedCount: 0
    };
    await updateDoc(progressRef, initialProgress);
    return initialProgress;
  }
  
  return progressSnap.data() as UserProgress;
}

// 목표 달성을 기록하는 함수
export async function markGoalComplete(uid: string) {
  const progressRef = doc(db, "userProgress", uid);
  const today = new Date().toISOString().split('T')[0];
  
  // 현재 진행 상황 확인
  const progressSnap = await getDoc(progressRef);
  const currentProgress = progressSnap.data() as UserProgress;
  
  // 오늘 이미 완료했는지 확인
  if (currentProgress?.lastCompletedDate === today) {
    throw new Error('이미 오늘의 목표를 달성했습니다.');
  }
  
  // 연속 달성 확인
  const isStreak = isConsecutiveDay(currentProgress?.lastCompletedDate);
  
  await updateDoc(progressRef, {
    completedCount: increment(1),
    streakDays: isStreak ? increment(1) : 1,
    lastCompletedDate: today
  });
}

// 연속된 날짜인지 확인하는 함수
function isConsecutiveDay(lastDate?: string): boolean {
  if (!lastDate) return false;
  
  const today = new Date();
  const last = new Date(lastDate);
  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

// 목표 수를 설정하는 함수
export async function setGoalCount(uid: string, count: number) {
  const progressRef = doc(db, "userProgress", uid);
  await updateDoc(progressRef, {
    goalCount: count
  });
}