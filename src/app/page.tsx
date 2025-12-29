"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./lib/auth-context"
import { useRouter } from "next/navigation"
import { logout } from "./lib/auth"
import { getUser, approvePostAndUpdateProgress, addPost, getPosts, getComments, addComment } from "./lib/firestore"
import { uploadImage } from "./lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Info, Target, MessageCircle, Menu, X, Award, TrendingUp, Calendar, CheckCircle, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GoalTrackerPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const fetchUserData = useCallback(async () => {
    if (user) {
      try {
        const data = await getUser(user.uid);
        if (!data) {
          router.push('/habit-input');
          return;
        }
        setUserData(data);
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }
  }, [user, router]);

  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await getPosts();
      const postsWithAuthors = await Promise.all(
        fetchedPosts.map(async (post: any) => {
          const author = await getUser(post.authorId);
          return { ...post, authorName: author?.name || "이름없음", comments: [] };
        })
      );
      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, []);

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex !== -1 && posts[postIndex].comments.length === 0) {
        const comments = await getComments(postId);
        const commentsWithAuthors = await Promise.all(
          comments.map(async (comment: any) => {
            const author = await getUser(comment.authorId);
            return { ...comment, authorName: author?.name || "이름없음" };
          })
        );
        const newPosts = [...posts];
        newPosts[postIndex].comments = commentsWithAuthors;
        setPosts(newPosts);
      }
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!user || !newComment) {
      alert("댓글을 입력해주세요.");
      return;
    }
    await addComment(postId, {
      authorId: user.uid,
      content: newComment,
    });
    setNewComment("");
    // Refetch comments for the post
    const comments = await getComments(postId);
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment: any) => {
        const author = await getUser(comment.authorId);
        return { ...comment, authorName: author?.name || "이름없음" };
      })
    );
    const postIndex = posts.findIndex(p => p.id === postId);
    const newPosts = [...posts];
    newPosts[postIndex].comments = commentsWithAuthors;
    setPosts(newPosts);
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    Promise.all([fetchUserData(), fetchPosts()]).finally(() => setLoading(false));
  }, [user, authLoading, router, fetchUserData, fetchPosts])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostTitle || !newPostContent) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (newPostImage) {
        console.log("Uploading image...");
        imageUrl = await uploadImage(newPostImage);
        console.log("Image uploaded:", imageUrl);
      }

      console.log("Adding post to firestore...");
      await addPost({
        authorId: user.uid,
        title: newPostTitle,
        content: newPostContent,
        imageUrl,
      });
      console.log("Post added to firestore.");

      await fetchPosts();

      setNewPostTitle("");
      setNewPostContent("");
      setNewPostImage(null);
      setIsPostModalOpen(false);
      alert("게시물이 작성되었습니다.");
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("게시물 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePost = async (postId: string, authorId: string) => {
    if (userData?.role !== 'teacher') {
      console.error("Only teachers can approve posts.");
      return;
    }
    try {
      await approvePostAndUpdateProgress(postId, authorId);
      await fetchPosts();
      // If the approved post belongs to the current user, refetch their data to show updated progress
      if (authorId === user?.uid) {
        fetchUserData();
      }
      alert("게시물을 승인했습니다.");
    } catch (error) {
      console.error("Failed to approve post:", error);
      alert("게시물 승인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968] relative overflow-hidden">
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in-50">
          <Card className="w-[90vw] max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">새 글 작성</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsPostModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">제목</Label>
                    <Input id="title" placeholder="제목을 입력하세요" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">내용</Label>
                    <textarea id="content" placeholder="내용을 입력하세요" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} className="w-full h-32 p-2 border rounded-md" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">사진</Label>
                    <Input id="image" type="file" onChange={e => setNewPostImage(e.target.files ? e.target.files[0] : null)} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "작성 중..." : "작성하기"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
      
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
              <div className="grid grid-cols-1 gap-2 md:gap-4 mb-5 md:mb-8">
                <div className="bg-gradient-to-br from-[#9DC183]/20 to-[#7FA968]/20 rounded-lg md:rounded-2xl p-2.5 md:p-4 text-center border-2 border-[#9DC183]/30">
                  <div className="flex items-center justify-center gap-1 mb-0.5 md:mb-1">
                    <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-[#7FA968]" />
                    <p className="text-[10px] md:text-sm font-bold text-gray-600">총 달성 횟수</p>
                  </div>
                  <p className="text-lg md:text-3xl font-black text-[#5A7C3E]">{userData.completedCount}</p>
                </div>
              </div>

              {/* Fruit grid with enhanced styling */}
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
            <Button size="sm" onClick={() => setIsPostModalOpen(true)} className="bg-white/90 text-[#5A7C3E] hover:bg-white">
              <Pencil className="w-4 h-4 mr-2" />새 글 작성
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {posts.map((post: any) => (
              <Card
                key={post.id}
                className="bg-white border-2 border-[#9DC183]/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group relative"
              >
                {post.imageUrl && (
                  <div className="relative h-36 md:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={post.imageUrl}
                      alt={`${post.authorName}의 게시물`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                )}

                <div className="p-3 md:p-6 pb-4">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div>
                      <h4 className="text-xs md:text-base font-bold text-[#5A7C3E]">{post.authorName}</h4>
                      <span className="text-[10px] md:text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 text-balance group-hover:text-[#5A7C3E] transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs md:text-base text-gray-700 leading-relaxed mb-2 md:mb-4">{post.content}</p>

                  <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 pt-2 md:pt-3 border-t border-gray-100">
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 md:gap-2 text-gray-500">
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">{post.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>

                {expandedPostId === post.id && (
                  <div className="p-3 md:p-6 bg-gray-50">
                    <div className="mb-4">
                      {post.comments.map((comment: any) => (
                        <div key={comment.id} className="mb-2">
                          <p className="text-xs text-gray-500">{comment.authorName}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력하세요..." />
                      <Button onClick={() => handleCommentSubmit(post.id)}>작성</Button>
                    </div>
                  </div>
                )}
                
                {/* Teacher approval actions */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  {userData?.role === 'teacher' && !post.approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-green-600 text-green-700 hover:bg-green-50"
                      onClick={() => handleApprovePost(post.id, post.authorId)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      승인
                    </Button>
                  )}
                  {post.approved && (
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
                  )}
                </div>
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



