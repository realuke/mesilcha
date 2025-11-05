"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./lib/auth-context"
import { useRouter } from "next/navigation"
import { logout } from "./lib/auth"
import { getUserProgress } from "./lib/user-progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Info, Target, MessageCircle, Menu, X, Award, TrendingUp, Calendar } from "lucide-react"

export default function GoalTrackerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [progress, setProgress] = useState({
    streakDays: 0,
    goalCount: 30,
    completedCount: 0
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getUserProgress(user.uid)
        .then(userProgress => {
          setProgress(userProgress)
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to load progress:', error)
          setLoading(false)
        })
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const posts = [
    {
      id: 1,
      title: "아침 운동 루틴 성공!",
      author: "이지은",
      content: "오늘도 아침 6시에 일어나서 운동했어요! 점점 습관이 되어가는 것 같아요.",
      timestamp: "2시간 전",
      image: "/morning-exercise-workout.jpg",
      commentCount: 12,
      approved: true,
    },
    {
      id: 2,
      title: "독서 습관 만들기",
      author: "박서준",
      content: "매일 책 읽기 목표 달성! 오늘은 자기계발서 30페이지 읽었습니다.",
      timestamp: "5시간 전",
      commentCount: 8,
      approved: true,
    },
    {
      id: 3,
      title: "하루 물 2L 마시기 도전",
      author: "최유나",
      content: "물 2L 마시기 성공! 건강해지는 느낌이에요 💪",
      timestamp: "1일 전",
      image: "/water-bottle-healthy-lifestyle.jpg",
      commentCount: 15,
      approved: false,
    },
    {
      id: 4,
      title: "영어 단어 암기 챌린지",
      author: "정민호",
      content: "영어 단어 50개 외우기 완료. 꾸준히 하니까 실력이 늘어요!",
      timestamp: "1일 전",
      commentCount: 5,
      approved: true,
    },
    {
      id: 5,
      title: "매일 명상하기",
      author: "김하늘",
      content: "명상 10분 완료! 마음이 차분해지는 시간이었어요.",
      timestamp: "2일 전",
      image: "/peaceful-nature-meditation.png",
      commentCount: 20,
      approved: false,
    },
    {
      id: 6,
      title: "기타 연습 30분",
      author: "이준호",
      content: "기타 연습 30분 달성. 오늘은 새로운 코드를 배웠어요!",
      timestamp: "2일 전",
      commentCount: 3,
      approved: true,
    },
  ]

  const completionRate = Math.round((progress.completedCount / progress.goalCount) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 md:opacity-10">
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-white rounded-full blur-2xl md:blur-3xl"></div>
        <div className="absolute bottom-20 md:bottom-40 right-10 md:right-20 w-24 md:w-40 h-24 md:h-40 bg-white rounded-full blur-2xl md:blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-16 md:w-24 h-16 md:h-24 bg-white rounded-full blur-xl md:blur-2xl"></div>
      </div>

      <nav className="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <h2 className="text-base md:text-lg font-bold text-[#5A7C3E]">매실차</h2>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[#5A7C3E] hover:bg-[#9DC183]/20">
                <Info className="w-4 h-4 mr-2" />
                프로젝트 소개
              </Button>
              <Button variant="ghost" size="sm" className="text-[#5A7C3E] hover:bg-[#9DC183]/20">
                <Target className="w-4 h-4 mr-2" />
                목표 달성 횟수
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#5A7C3E] hover:bg-[#9DC183]/20"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-[#5A7C3E] p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="sm" className="justify-start text-[#5A7C3E] hover:bg-[#9DC183]/20">
                  <Info className="w-4 h-4 mr-2" />
                  프로젝트 소개
                </Button>
                <Button variant="ghost" size="sm" className="justify-start text-[#5A7C3E] hover:bg-[#9DC183]/20">
                  <Target className="w-4 h-4 mr-2" />
                  목표 달성 횟수
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-[#5A7C3E] hover:bg-[#9DC183]/20"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12 relative z-10">
        {loading ? (
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
              {user?.displayName || '사용자'}님은 총 <span className="text-[#E67E22]">{progress.completedCount}개</span>의 목표를 달성했어요!
            </h2>
            <span className="text-xl md:text-5xl relative z-10 animate-pulse flex-shrink-0">🔥</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-8 md:mb-16">
          <Card className="bg-gradient-to-br from-white to-white/95 border-0 shadow-2xl overflow-hidden relative">
            {/* Decorative pattern background */}
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
              {/* Header with icon */}
              <div className="text-center mb-5 md:mb-8">
                <div className="inline-flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#F4D03F] to-[#E67E22] flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-4xl font-black text-[#5A7C3E]">나의 목표 달성</h3>
                </div>
                <p className="text-xs md:text-base text-gray-600 font-medium">매일 하나씩 익어가는 나의 성장</p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-5 md:mb-8">
                <div className="bg-gradient-to-br from-[#F4D03F]/20 to-[#E67E22]/20 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-center border-2 border-[#F4D03F]/30">
                  <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                    <Target className="w-3 h-3 md:w-5 md:h-5 text-[#E67E22]" />
                    <p className="text-[10px] md:text-sm font-bold text-gray-600">목표</p>
                  </div>
                  <p className="text-lg md:text-3xl font-black text-[#5A7C3E]">{progress.goalCount}</p>
                </div>
                <div className="bg-gradient-to-br from-[#9DC183]/20 to-[#7FA968]/20 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-center border-2 border-[#9DC183]/30">
                  <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                    <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-[#7FA968]" />
                    <p className="text-[10px] md:text-sm font-bold text-gray-600">달성</p>
                  </div>
                  <p className="text-lg md:text-3xl font-black text-[#5A7C3E]">{progress.completedCount}</p>
                </div>
                <div className="bg-gradient-to-br from-[#7CB342]/20 to-[#689F38]/20 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-center border-2 border-[#7CB342]/30">
                  <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                    <Calendar className="w-3 h-3 md:w-5 md:h-5 text-[#689F38]" />
                    <p className="text-[10px] md:text-sm font-bold text-gray-600">달성률</p>
                  </div>
                  <p className="text-lg md:text-3xl font-black text-[#5A7C3E]">{completionRate}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6 md:mb-8">
                <div className="h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#F4D03F] via-[#F39C12] to-[#E67E22] rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Fruit grid with enhanced styling */}
              <div className="relative bg-gradient-to-br from-[#f8faf6] to-[#e8f5e0] rounded-xl md:rounded-3xl p-4 md:p-10 shadow-inner border-2 border-[#9DC183]/20">
                <div className="absolute top-2 left-2 md:top-3 md:left-3 w-6 h-6 md:w-8 md:h-8 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-[#9DC183]/30 rounded-tl-lg md:rounded-tl-xl"></div>
                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-[#9DC183]/30 rounded-tr-lg md:rounded-tr-xl"></div>
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 w-6 h-6 md:w-8 md:h-8 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-[#9DC183]/30 rounded-bl-lg md:rounded-bl-xl"></div>
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 md:w-8 md:h-8 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-[#9DC183]/30 rounded-br-lg md:rounded-br-xl"></div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
                  {Array.from({ length: progress.goalCount }).map((_, index) => {
                    const fruitNumber = index + 1
                    const isCompleted = fruitNumber <= progress.completedCount

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
                          {/* Stem */}
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 md:w-3 md:h-3 bg-[#5A7C3E] rounded-full shadow-sm"></div>
                          {/* Highlight */}
                          <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 w-1.5 h-1.5 md:w-3 md:h-3 bg-white/60 rounded-full blur-[1px]"></div>
                          {/* Number */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className={`text-[10px] md:text-sm font-bold drop-shadow-md ${
                                isCompleted ? "text-white" : "text-white/90"
                              }`}
                            >
                              {fruitNumber}
                            </span>
                          </div>
                          {/* Shine effect for completed fruits */}
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

        <div>
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-xl md:text-3xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg md:text-3xl font-black text-white drop-shadow-lg">목표를 달성한 학생들</h3>
                <p className="text-xs md:text-base text-white/80 font-medium">함께 성장하는 우리의 이야기</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="bg-white border-2 border-[#9DC183]/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group relative"
              >
                {post.image && (
                  <div className="relative h-36 md:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={`${post.author}의 게시물`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                )}

                <div className="p-3 md:p-6 pb-16 md:pb-20">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div>
                      <h4 className="text-xs md:text-base font-bold text-[#5A7C3E]">{post.author}</h4>
                      <span className="text-[10px] md:text-xs text-gray-400">{post.timestamp}</span>
                    </div>
                  </div>

                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 text-balance group-hover:text-[#5A7C3E] transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs md:text-base text-gray-700 leading-relaxed mb-2 md:mb-4">{post.content}</p>

                  <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 pt-2 md:pt-3 border-t border-gray-100">
                    <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">{post.commentCount}</span>
                  </div>
                </div>

                {/* Teacher approval stamp in bottom right corner */}
                {post.approved && (
                  <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10">
                    <div className="relative w-14 h-14 md:w-20 md:h-20 animate-in zoom-in duration-500">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F4D03F] via-[#F39C12] to-[#E67E22] shadow-lg rotate-12 opacity-95"></div>
                      <div className="absolute inset-0.5 md:inset-1 rounded-full border-2 border-dashed border-white/60"></div>
                      <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 w-3 h-3 md:w-4 md:h-4 bg-white/40 rounded-full blur-sm"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-12">
                        <span className="text-[9px] md:text-xs font-black text-white drop-shadow-md leading-tight text-center">
                          참<br />
                          잘했어요
                        </span>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#5A7C3E] rounded-full shadow-md"></div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  )
}
