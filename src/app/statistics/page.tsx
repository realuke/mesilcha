"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth-context"
import { useRouter } from "next/navigation"
import { getUsersSortedByCompletedCount, UserData } from "../lib/firestore"
import Navbar from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true); // Set loading true here
      const data = await getUsersSortedByCompletedCount();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error)
    } finally {
      setLoading(false); // Set loading false here
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    fetchLeaderboard(); // Just call the function
  }, [user, authLoading, router, fetchLeaderboard])


  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-center mb-8 md:mb-12 relative">
            <div className="absolute -inset-2 md:-inset-4 bg-yellow-300/30 rounded-2xl md:rounded-3xl blur-lg"></div>
            <Trophy className="w-10 h-10 md:w-14 md:h-14 text-yellow-600 fill-yellow-500 z-10 mr-4 drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-black text-yellow-800 z-10 drop-shadow-lg">함께하는 실천 기록</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-lg text-gray-700">데이터를 불러오는 중...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((member, index) => (
                <Card 
                  key={member.uid} 
                  className={`flex items-start p-4 md:p-5 border-l-4 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-[1.01]
                    ${index === 0 ? 'border-[#FFD700] bg-yellow-50/50' : 
                    index === 1 ? 'border-gray-300 bg-gray-100/50' :
                    index === 2 ? 'border-[#CD7F32] bg-amber-50/50' :
                    'border-[#9DC183]/50 bg-white'
                  }`}
                >
                  <span className="font-bold text-lg md:text-xl text-gray-700 mr-4 w-6 text-center">#{index + 1}</span>
                  <div className="flex-1 flex flex-col">
                    <span className="text-xl md:text-2xl font-semibold text-[#5A7C3E] mb-2">{member.name}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from({ length: Math.min(member.completedCount, 30) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full bg-gradient-to-br from-[#F4D03F] via-[#F39C12] to-[#E67E22] shadow-sm"
                        ></div>
                      ))}
                      {member.completedCount > 30 && ( // Show exact count if more than 30
                        <span className="text-sm font-semibold text-gray-600 ml-1">+{member.completedCount - 30}</span>
                      )}
                      <span className="text-xl md:text-2xl font-bold text-[#E67E22] ml-2">{member.completedCount}회</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
