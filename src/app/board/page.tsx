"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth-context"
import { useRouter } from "next/navigation"
import { getUser, approvePostAndUpdateProgress, addPost, getPosts, getComments, addComment, deletePost, deleteComment, UserData, PostData, CommentData } from "../lib/firestore"
import { uploadImage } from "../lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, CheckCircle, Pencil, Trash2 } from "lucide-react"
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
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
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
          return {
            ...post,
            commentCount: post.commentCount || 0, // Default to 0 if undefined
            authorName: author?.name || "이름없음",
            comments: []
          };
        })
      );
      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, []);

  const handlePostClick = async (post: PostData) => {
    // Fetch comments for the selected post
    const comments = await getComments(post.id);
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment: CommentData) => {
        const author = await getUser(comment.authorId);
        return { ...comment, authorName: author?.name || "이름없음" };
      })
    );
    // Set the selected post with its comments
    setSelectedPost({ ...post, comments: commentsWithAuthors });
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!user || !newComment || !selectedPost) {
      alert("댓글을 입력해주세요.");
      return;
    }
    await addComment(postId, {
      authorId: user.uid,
      content: newComment,
    });
    setNewComment("");

    // Refetch comments and update the selectedPost state
    const comments = await getComments(postId);
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment: CommentData) => {
        const author = await getUser(comment.authorId);
        return { ...comment, authorName: author?.name || "이름없음" };
      })
    );

    setSelectedPost({
      ...selectedPost,
      comments: commentsWithAuthors,
      commentCount: (selectedPost.commentCount || 0) + 1
    });

    // Also update the main posts list to reflect the new comment count
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      const newPosts = [...posts];
      newPosts[postIndex].commentCount = (newPosts[postIndex].commentCount || 0) + 1;
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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("정말로 게시물을 삭제하시겠습니까? 모든 댓글도 함께 삭제됩니다.")) {
      return;
    }
    try {
      await deletePost(postId);
      setSelectedPost(null);
      await fetchPosts(); // Refresh the posts list
      alert("게시물이 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("게시물 삭제에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost || !window.confirm("정말로 댓글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deleteComment(selectedPost.id, commentId);
      
      // Update local state directly
      const updatedComments = selectedPost.comments?.filter(c => c.id !== commentId);
      const updatedPost = {
        ...selectedPost,
        comments: updatedComments,
        commentCount: (selectedPost.commentCount || 1) - 1,
      };
      setSelectedPost(updatedPost);

      // Also update the main posts list to reflect the new comment count
      const postIndex = posts.findIndex(p => p.id === selectedPost.id);
      if (postIndex !== -1) {
        const newPosts = [...posts];
        newPosts[postIndex].commentCount = (newPosts[postIndex].commentCount || 1) - 1;
        setPosts(newPosts);
      }
      
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("댓글 삭제에 실패했습니다.");
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
                              onClick={() => handlePostClick(post)}
                              className="bg-gradient-to-br from-white to-gray-50 border-2 border-[#9DC183]/40 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group relative cursor-pointer"
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
              
                              </div>
                              
                              {/* Teacher approval actions */}
                              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                                {userData?.role === 'teacher' && !post.approved && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/80 backdrop-blur-sm border-green-600 text-green-700 hover:bg-green-50"
                                    onClick={(e) => { e.stopPropagation(); handleApprovePost(post.id, post.authorId); }}
                                  >
                                                          <CheckCircle className="w-4 h-4 mr-2" />
                                                          실천 완료!
                                                        </Button>                                )}
                                {post.approved && (
                                  <div className="relative w-14 h-14 md:w-20 md:h-20 animate-in zoom-in duration-500">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F4D03F] via-[#F39C12] to-[#E67E22] shadow-lg rotate-12 opacity-95"></div>
                                    <div className="absolute inset-0.5 md:inset-1 rounded-full border-2 border-dashed border-white/60"></div>
                                    <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 w-3 h-3 md:w-4 md:h-4 bg-white/40 rounded-full blur-sm"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-12">
                                                              <span className="text-[9px] md:text-xs font-black text-white drop-shadow-md leading-tight text-center">
                                                                실천<br />
                                                                완료!
                                                              </span>                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#5A7C3E] rounded-full shadow-md"></div>
                                  </div>
                                )}
                              </div>
                            </Card>
            ))}
          </div>
        </>
        )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div 
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 bg-black/70 z-[60] flex justify-center animate-in fade-in-50 px-4 py-20"
        >
          <Card 
            onClick={(e) => e.stopPropagation()}
            className="w-[95vw] max-w-3xl max-h-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 p-5 border-b flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPost.title}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  <span>{selectedPost.authorName}</span>
                  <span className="mx-2">·</span>
                  <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(user?.uid === selectedPost.authorId || userData?.role === 'teacher') && (
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePost(selectedPost.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedPost(null)} className="rounded-full w-8 h-8 p-0">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {selectedPost.imageUrl && (
                <div className="relative h-64 md:h-96 mb-6 rounded-lg overflow-hidden border">
                  <Image
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-base md:text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>

              {/* Comments Section (now inside scrollable area) */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-bold text-gray-800 mb-4">댓글 ({selectedPost.commentCount || 0})</h4>
                <div className="space-y-4 mb-6">
                  {selectedPost.comments?.map((comment: CommentData) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg shadow-sm border flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-800 font-semibold mb-1">{comment.authorName}</p>
                        <p className="text-base text-gray-700">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                      {(user?.uid === comment.authorId || userData?.role === 'teacher') && (
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full flex-shrink-0" onClick={() => handleDeleteComment(comment.id)}>
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="따뜻한 댓글을 남겨주세요..."
                    className="flex-1 bg-white rounded-full px-4 py-2 border-2 border-gray-200 focus:border-[#9DC183] transition-colors"
                  />
                  <Button
                    onClick={() => handleCommentSubmit(selectedPost.id)}
                    className="bg-[#5A7C3E] text-white rounded-full px-6 py-2 hover:bg-[#7FA968] transition-colors shadow-md text-base"
                  >
                    작성
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      </main>
    </div>
  )
}
