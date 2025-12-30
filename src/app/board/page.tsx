"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth-context"
import { useRouter } from "next/navigation"
import { getUser, approvePostAndUpdateProgress, addPost, getPosts, getComments, addComment, UserData, PostData, CommentData } from "../lib/firestore"
import { uploadImage } from "../lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, CheckCircle, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import Image from "next/image"

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
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
        fetchedPosts.map(async (post: PostData) => {
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
      if (postIndex !== -1 && (!posts[postIndex].comments || posts[postIndex].comments.length === 0)) {
        const comments = await getComments(postId);
        const commentsWithAuthors = await Promise.all(
          comments.map(async (comment: CommentData) => {
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

    // Update local state
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      const newPosts = [...posts];
      
      // Increment comment count locally
      newPosts[postIndex].commentCount = (newPosts[postIndex].commentCount || 0) + 1;

      // Refetch comments for the current post to show the new one
      const comments = await getComments(postId);
      const commentsWithAuthors = await Promise.all(
        comments.map(async (comment: CommentData) => {
          const author = await getUser(comment.authorId);
          return { ...comment, authorName: author?.name || "이름없음" };
        })
      );
      newPosts[postIndex].comments = commentsWithAuthors;

      setPosts(newPosts);
    }
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
        imageUrl = await uploadImage(newPostImage);
      }

      await addPost({
        authorId: user.uid,
        title: newPostTitle,
        content: newPostContent,
        imageUrl,
      });

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
    } catch (error) {
      console.error("Failed to approve post:", error);
      alert("게시물 승인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#9DC183] via-[#8BB76E] to-[#7FA968]">
      <Navbar />
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
            <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-lg">데이터를 불러오는 중...</div>
          </div>
        ) : (
        <>
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <div className="flex items-center gap-2 md:gap-4">
              <div>
                <h3 className="text-lg md:text-3xl font-black text-white drop-shadow-lg">게시판</h3>
                <p className="text-xs md:text-base text-white/80 font-medium">함께 성장하는 우리의 이야기</p>
              </div>
            </div>
            <div>
            <Button
              size="lg"
              onClick={() => setIsPostModalOpen(true)}
              className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 rounded-full shadow-2xl bg-[#FFD700] text-[#5A7C3E] hover:bg-[#FFC107] h-16 w-16"
            >
              <Pencil className="w-6 h-6" />
            </Button>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {posts.map((post: PostData) => (
              <Card
                key={post.id}
                className="bg-gradient-to-br from-white to-gray-50 border-2 border-[#9DC183]/40 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group relative"
              >
                {post.imageUrl && (
                  <div className="relative h-36 md:h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image
                      src={post.imageUrl}
                      alt={`${post.authorName}의 게시물`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                )}

                <div className="p-3 md:p-6 pb-4">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div>
                      <h4 className="text-sm md:text-lg font-bold text-[#5A7C3E]">{post.authorName}</h4>
                      <span className="text-[11px] md:text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 text-balance group-hover:text-[#5A7C3E] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6 line-clamp-3">{post.content}</p>

                  <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 pt-3 md:pt-4 border-t border-gray-100">
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 md:gap-2 text-gray-500">
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">{post.commentCount || 0}</span>
                    </button>
                  </div>
                </div>

                {expandedPostId === post.id && (
                  <div className="p-3 md:p-6 bg-gray-50/50 border-t border-gray-100">
                    <div className="mb-4 space-y-3">
                      {post.comments?.map((comment: CommentData) => (
                        <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600 font-semibold mb-1">{comment.authorName}</p>
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="따뜻한 댓글을 남겨주세요..."
                        className="flex-1 bg-white rounded-full px-4 py-2 border-2 border-transparent focus:border-[#9DC183] transition-colors"
                      />
                      <Button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="bg-[#5A7C3E] text-white rounded-full px-5 py-2 hover:bg-[#7FA968] transition-colors shadow-md"
                      >
                        작성
                      </Button>
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
        </>
        )}
      </main>
    </div>
  )
}
