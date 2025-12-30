"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { logout } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Info, Target, Menu, X, Trophy } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" passHref>
            <h2 className="text-base md:text-lg font-bold text-[#5A7C3E] cursor-pointer">매실차</h2>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/intro" passHref>
              <Button variant="ghost" size="sm" className="text-[#5A7C3E] hover:bg-[#9DC183]/20">
                <Info className="w-4 h-4 mr-2" />
                프로젝트 소개
              </Button>
            </Link>
            <Link href="/board" passHref>
              <Button variant="ghost" size="sm" className="text-[#5A7C3E] hover:bg-[#9DC183]/20">
                <Target className="w-4 h-4 mr-2" />
                게시판
              </Button>
            </Link>
            <Link href="/statistics" passHref>
              <Button variant="ghost" size="sm" className="text-[#5A7C3E] hover:bg-[#9DC183]/20">
                <Trophy className="w-4 h-4 mr-2" />
                통계
              </Button>
            </Link>
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
              <Link href="/intro" passHref>
                <Button variant="ghost" size="sm" className="justify-start text-[#5A7C3E] hover:bg-[#9DC183]/20">
                  <Info className="w-4 h-4 mr-2" />
                  프로젝트 소개
                </Button>
              </Link>
              <Link href="/board" passHref>
                <Button variant="ghost" size="sm" className="justify-start text-[#5A7C3E] hover:bg-[#9DC183]/20">
                  <Target className="w-4 h-4 mr-2" />
                  게시판
                </Button>
              </Link>
              <Link href="/statistics" passHref>
                <Button variant="ghost" size="sm" className="justify-start text-[#5A7C3E] hover:bg-[#9DC183]/20">
                  <Trophy className="w-4 h-4 mr-2" />
                  통계
                </Button>
              </Link>
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
  )
}
