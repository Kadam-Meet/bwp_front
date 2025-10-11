import React, { useState, useEffect } from "react"
import { MessageCircle, Send, Reply, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { getPostComments, createComment, deleteComment, ApiComment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface CommentsSectionProps {
  postId: string
  currentUser: any
  isOpen: boolean
  onToggle: () => void
}

export function CommentsSection({ postId, currentUser, isOpen, onToggle }: CommentsSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const { toast } = useToast()

  // Load comments when section opens
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      loadComments()
    }
  }, [isOpen, postId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const commentsData = await getPostComments(postId)
      setComments(commentsData)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    try {
      setSubmitting(true)
      const comment = await createComment({
        postId,
        authorId: currentUser.id,
        content: newComment.trim()
      })
      
      setComments(prev => [comment, ...prev])
      setNewComment("")
      
      toast({
        title: "Success",
        description: "Comment posted!"
      })
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !currentUser) return

    try {
      setSubmitting(true)
      const reply = await createComment({
        postId,
        authorId: currentUser.id,
        content: replyText.trim(),
        parentCommentId
      })
      
      // Add reply to the parent comment
      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ))
      
      setReplyText("")
      setReplyingTo(null)
      
      toast({
        title: "Success",
        description: "Reply posted!"
      })
    } catch (error) {
      console.error('Failed to create reply:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return

    try {
      await deleteComment(commentId, currentUser.id)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      
      toast({
        title: "Success",
        description: "Comment deleted"
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{comments.length}</span>
      </Button>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Comments ({comments.length})</h3>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                {currentUser?.alias ? currentUser.alias.charAt(0) : currentUser?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!newComment.trim() || submitting}
                  className="spill-button"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                      {comment.author.alias ? comment.author.alias.charAt(0) : comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {comment.author.alias || comment.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      {currentUser && comment.author.name === currentUser.name && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-11 space-y-2">
                    <div className="flex items-start space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                          {currentUser?.alias ? currentUser.alias.charAt(0) : currentUser?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyText("")
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyText.trim() || submitting}
                            className="h-6 px-2 text-xs spill-button"
                          >
                            {submitting ? "Posting..." : "Reply"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="gradient-accent text-white text-xs font-bold">
                            {reply.author.alias ? reply.author.alias.charAt(0) : reply.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-xs">
                              {reply.author.alias || reply.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
