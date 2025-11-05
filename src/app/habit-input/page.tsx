'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { addUser } from "../lib/firestore";

export default function HabitInputPage() {
  const [habit, setHabit] = useState("");
  const router = useRouter();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      await addUser({
        uid: user.uid,
        name: user.displayName || "익명 사용자",
        email: user.email || "no-email",
        role: "students",
        habit,
        goalCount: 0,
      });
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">습관 입력</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          placeholder="습관을 입력하세요"
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
          className="w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          저장
        </button>
      </form>
    </div>
  );
}