'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { addUser, getUser } from '../lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HabitInputPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [habit, setHabit] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return; // Still checking auth state
    }

    if (!user) {
      router.push('/login'); // Not authenticated, redirect to login
      return;
    }

    const checkUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUser(user.uid);
        if (userData) {
          router.push('/'); // User already has a profile, redirect to main page
        }
      } catch (error) {
        console.error('Failed to check user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !habit) {
      alert('습관을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await addUser({
        uid: user.uid,
        name: user.displayName || '이름없음', // Use Google display name
        email: user.email || '',
        role: 'student',
        habit,
      });
      alert('사용자 정보가 저장되었습니다!');
      router.push('/'); // Redirect to main page after saving
    } catch (error) {
      console.error('Failed to save user data:', error);
      alert('사용자 정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968]">
        <p className="text-white text-lg">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>환영합니다, {user?.displayName || '사용자'}님!</CardTitle>
          <CardDescription>매실차 프로젝트를 시작하기 위해 마지막 한 단계만 남았어요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="habit">나의 습관 목표</Label>
                <Input
                  id="habit"
                  placeholder="예: 매일 책 30분 읽기"
                  value={habit}
                  onChange={(e) => setHabit(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              시작하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
