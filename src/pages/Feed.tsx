import React, { useEffect, useState } from "react"
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, Flame, Coffee, Flag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge as UiBadge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { getPosts, getPostReactions, addReaction, deletePost as apiDeletePost } from "@/lib/api"

interface Post {
  id: string
  authorId?: string
  author: string
  alias: string
  content: string
  timestamp: string
  duration: string
  reactions: {
    tea: number
    spicy: number
    cap: number
    hearts: number
  }
  replies: number
  category: string
  isVoiceNote?: boolean
}

// api imports moved above

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const currentUserId = (typeof window !== 'undefined' && (localStorage.getItem('userId') || localStorage.getItem('anonymousUserId'))) || ""

  const handleReaction = async (postId: string, type: keyof Post['reactions']) => {
    try {
      // For demo purposes, we'll use a dummy userId
      // In a real app, this would come from authentication
      const userId = "demo-user-id"
      
      await addReaction(postId, userId, type)
      
      // Update local state optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, reactions: { ...post.reactions, [type]: post.reactions[type] + 1 } }
          : post
      ))
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'tea': return '☕'
      case 'spicy': return '🌶️'
      case 'cap': return '🧢'
      default: return '❤️'
    }
  }
  useEffect(() => {
    const loadPosts = async () => {
      try {
        console.log('Loading posts from API...')
        const apiPosts = await getPosts()
        console.log('Received posts:', apiPosts.length)
        
        // Map API posts to UI shape
        const uiPosts: Post[] = apiPosts.map((p) => ({
          id: p.id,
          authorId: p.authorId,
          author: p.author.name,
          alias: p.author.alias || "Anon",
          content: p.content,
          timestamp: new Date(p.createdAt).toLocaleString(),
          duration: p.duration,
          reactions: { tea: 0, spicy: 0, cap: 0, hearts: 0 }, // Start with zero reactions
          replies: 0,
          category: p.room.name,
          isVoiceNote: p.isVoiceNote
        }))
        
        setPosts(uiPosts)
        console.log('Posts set:', uiPosts.length)
        
        // Load reactions for each post (simplified)
        for (const apiPost of apiPosts) {
          try {
            const reactionData = await getPostReactions(apiPost.id)
            setPosts(prevPosts => prevPosts.map(post => 
              post.id === apiPost.id 
                ? { ...post, reactions: reactionData.reactions }
                : post
            ))
          } catch (error) {
            console.error('Failed to load reactions for post:', apiPost.id, error)
          }
        }
      } catch (error) {
        console.error('Failed to load posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [])

  const handleDelete = async (postId: string) => {
    try {
      if (!currentUserId) return
      const confirmed = window.confirm('Delete this post? This cannot be undone.')
      if (!confirmed) return
      await apiDeletePost(postId, currentUserId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Celeb Gossip': return 'gradient-primary'
      case 'Movies': return 'gradient-accent'
      case 'Gaming': return 'gradient-warm'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-2xl">
        <div className="space-y-6">
          {/* Feed Header */}
          <div className="text-center py-6 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Latest Tea</h1>
            <p className="text-muted-foreground">Fresh gossip, hot takes, and spicy reviews</p>
            {/* Debug Info */}
            <div className="mt-4 p-4 bg-muted rounded-lg text-left text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Posts Count: {posts.length}</p>
              <p>Check browser console for detailed logs</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading posts...</p>
            </div>
          )}

          {/* Posts */}
          {!loading && (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">☕</div>
                  <h3 className="text-lg font-semibold mb-2">No tea yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to spill some tea in this room!
                  </p>
                </div>
              ) : (
                posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="tea-card animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getCategoryColor(post.category)} text-white font-semibold`}>
                          {post.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{post.alias}</h3>
                        <p className="text-xs text-muted-foreground">@{post.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UiBadge variant="secondary" className="text-xs">
                        {post.category}
                      </UiBadge>
                      {currentUserId && post.authorId && currentUserId === post.authorId ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(post.id)}
                          aria-label="delete post"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="more" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-0">
                  <div className="space-y-3">
                    {post.isVoiceNote && (
                      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-accent rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-accent-foreground rounded-full" />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">1:23</span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {post.duration === 'permanent' ? (
                          <Flame className="h-3 w-3 text-orange-500" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span>{post.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <div className="w-full space-y-3">
                    {/* Reactions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {Object.entries(post.reactions).map(([type, count]) => (
                          <Button
                            key={type}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post.id, type as keyof Post['reactions'])}
                            className="flex items-center space-x-1 hover-scale transition-smooth p-2 rounded-full"
                          >
                            <span className="text-base">{getReactionIcon(type)}</span>
                            <span className="text-xs font-medium">{count}</span>
                          </Button>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">{post.replies}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
                ))
              )}
            </div>
          )}

          {/* Load More */}
          <div className="text-center py-8">
            <Button variant="outline" className="hover-glow">
              Load More Tea
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}