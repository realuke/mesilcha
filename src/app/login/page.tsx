'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getUser } from "../lib/firestore";

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const existingUser = await getUser(user.uid);
          // 토큰 생성 및 쿠키 저장
          const token = await user.getIdToken();
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
          
          if (existingUser === null) {
            router.replace("/habit-input");
          } else {
            // URL 파라미터에서 원래 가려던 페이지 확인
            const params = new URLSearchParams(window.location.search);
            const from = params.get('from') || '/';
            router.replace(from);
          }
        } catch (error) {
          console.error("사용자 데이터 로딩 실패:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">로그인</h1>
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Google 로그인
      </button>
    </div>
  );
}