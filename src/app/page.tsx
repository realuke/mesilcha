"use client"

import { useState, useCallback, useEffect } from "react"
import { getUser, UserData } from "./lib/firestore"
import { Card } from "@/components/ui/card"
import Navbar from "@/components/navbar"
import { Award, TrendingUp } from "lucide-react"

import { useAuth } from "./lib/auth-context"
import { useRouter } from "next/navigation"

export default function GoalTrackerPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [userData, setUserData] = useState<UserData | null>(null)

  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async () => {
    if (user) {
      try {
        setLoading(true)
        const data = await getUser(user.uid);
        if (!data) {
          router.push('/habit-input');
          return;
        }
        setUserData(data);
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (authLoading || !user) {
      // Wait for auth to load, or user to be present
      return;
    }
    fetchUserData();
  }, [user, authLoading, fetchUserData])





  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968] relative overflow-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12 relative z-10">
        {loading || !userData ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-lg">데이터를 불러오는 중...</div>
          </div>
        ) : (
        <>
          <div className="text-center mb-6 md:mb-12">
          <div className="inline-block relative">
            <div className="absolute -inset-2 md:-inset-4 bg-white/20 rounded-2xl md:rounded-3xl blur-lg md:blur-xl"></div>
            <div className="relative">
              <h1 className="text-3xl md:text-7xl font-black text-white mb-1 md:mb-2 tracking-tight drop-shadow-2xl px-2">
                매실차 프로젝트
              </h1>
              <div className="h-1 md:h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-80 mb-2"></div>
              <p className="text-base md:text-2xl text-white/95 mt-2 md:mt-4 font-semibold drop-shadow-lg px-2">
                매일의 실천이 만드는 차이
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 md:gap-4 bg-gradient-to-r from-white via-white to-white/95 rounded-xl md:rounded-3xl px-3 md:px-12 py-3 md:py-6 shadow-2xl border-2 border-white/50 relative overflow-hidden max-w-[95%] md:max-w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F]/10 via-transparent to-[#E67E22]/10"></div>
            <span className="text-xl md:text-5xl relative z-10 animate-pulse flex-shrink-0">🔥</span>
            <h2 className="text-xs md:text-3xl font-bold text-[#5A7C3E] relative z-10 leading-tight whitespace-nowrap">
              {userData.name || '사용자'}님은 총 <span className="text-[#E67E22]">{userData.completedCount}회</span> 목표를 달성했어요!
            </h2>
            <span className="text-xl md:text-5xl relative z-10 animate-pulse flex-shrink-0">🔥</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-8 md:mb-16">
          <Card className="bg-gradient-to-br from-white to-white/95 border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle, #5A7C3E 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>

            <div className="relative z-10 p-4 md:p-10">
              <div className="text-center mb-5 md:mb-8">
                <div className="inline-flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#F4D03F] to-[#E67E22] flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-4xl font-black text-[#5A7C3E]">나의 목표 달성</h3>
                </div>
                <p className="text-xs md:text-base text-gray-600 font-medium">매일 하나씩 익어가는 나의 성장</p>
              </div>

              <div className="grid grid-cols-1 gap-2 md:gap-4 mb-5 md:mb-8">
                <div className="bg-gradient-to-br from-[#9DC183]/20 to-[#7FA968]/20 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-center border-2 border-[#9DC183]/30">
                  <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                    <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-[#7FA968]" />
                    <p className="text-[10px] md:text-sm font-bold text-gray-600">총 달성 횟수</p>
                  </div>
                  <p className="text-lg md:text-3xl font-black text-[#5A7C3E]">{userData.completedCount}</p>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-[#f8faf6] to-[#e8f5e0] rounded-xl md:rounded-3xl p-4 md:p-10 shadow-inner border-2 border-[#9DC183]/20">
                <div className="absolute top-2 left-2 md:top-3 md:left-3 w-6 h-6 md:w-8 md:h-8 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-[#9DC183]/30 rounded-tl-lg md:rounded-tl-xl"></div>
                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-[#9DC183]/30 rounded-tr-lg md:rounded-tr-xl"></div>
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 w-6 h-6 md:w-8 md:h-8 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-[#9DC183]/30 rounded-bl-lg md:rounded-bl-xl"></div>
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 md:w-8 md:h-8 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-[#9DC183]/30 rounded-br-lg md:rounded-br-xl"></div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
                  {Array.from({ length: 30 }).map((_, index) => {
                    const fruitNumber = index + 1
                    const isCompleted = fruitNumber <= userData.completedCount

                    return (
                      <div
                        key={index}
                        className="aspect-square relative flex items-center justify-center animate-in fade-in zoom-in"
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <div
                          className={`w-full h-full rounded-full shadow-lg relative overflow-hidden active:scale-95 transition-all duration-300 ${
                            isCompleted
                              ? "bg-gradient-to-br from-[#F4D03F] via-[#F39C12] to-[#E67E22] shadow-[#E67E22]/30"
                              : "bg-gradient-to-br from-[#A8D08D] to-[#7CB342] shadow-[#7CB342]/20"
                          }`}
                        >
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 md:w-3 md:h-3 bg-[#5A7C3E] rounded-full shadow-sm"></div>
                          <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 w-1.5 h-1.5 md:w-3 md:h-3 bg-white/60 rounded-full blur-[1px]"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className={`text-[10px] md:text-sm font-bold drop-shadow-md ${
                                isCompleted ? "text-white" : "text-white/90"
                              }`}
                            >
                              {fruitNumber}
                            </span>
                          </div>
                          {isCompleted && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
        </>
        )}
      </main>
    </div>
  )
}



