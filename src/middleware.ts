import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 현재 페이지의 경로
  const path = request.nextUrl.pathname
  
  // 인증이 필요하지 않은 페이지 목록
  const publicPaths = ['/login', '/habit-input']
  
  // 현재 페이지가 public 페이지인지 확인
  const isPublicPage = publicPaths.includes(path)
  
  // 쿠키에서 인증 토큰 확인
  const token = request.cookies.get('token')?.value

  // 로그인되지 않은 상태에서 보호된 페이지 접근
  if (!token && !isPublicPage) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }

  // 이미 로그인된 상태에서 로그인 페이지 접근
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}