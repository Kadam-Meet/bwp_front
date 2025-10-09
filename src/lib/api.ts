export type ApiPost = {
  id: string
  title: string
  content: string
  authorId: string
  author: {
    name: string
    alias: string | null
    anonymousId: string | null
  }
  room: {
    id: string
    name: string
    icon: string
    gradient: string
  }
  category: string
  duration: string
  isVoiceNote: boolean
  expiresAt: string | null
  createdAt: string
}

export type ApiRoom = {
  id: string
  name: string
  description: string
  icon: string
  gradient: string
  isTrending: boolean
  memberCount: number
  recentPostCount: number
  lastActivity: string | null
  createdAt: string
}

export type ApiReaction = {
  tea: number
  spicy: number
  cap: number
  hearts: number
}

// API base URL comes from env for consistency across environments.
// Set VITE_API_URL to your hosted backend (e.g., https://api.example.com)
// Falls back to production URL, then "/api" for local dev
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl) {
    return envUrl.replace(/\/$/, "")
  }
  
  // Production fallback
  if (import.meta.env.PROD) {
    return "https://bwp-back-1.onrender.com"
  }
  
  // Development fallback
  return "/api"
}

const API_BASE = getApiBase()

// Debug logging
console.log('🔧 [API] Environment VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('🔧 [API] Environment PROD:', import.meta.env.PROD)
console.log('🔧 [API] Resolved API_BASE:', API_BASE)

// Agora
export async function getRtcToken(params: { channel: string; uid?: string | number; role?: 'publisher' | 'subscriber'; expireSeconds?: number }): Promise<{ token: string; uid: string | number }>{
  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error("Failed to get token")
  return res.json()
}

export async function getPosts(roomId?: string): Promise<ApiPost[]> {
  const url = roomId ? `${API_BASE}/posts?roomId=${roomId}` : `${API_BASE}/posts`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch posts")
  return res.json()
}

export async function deletePost(postId: string, userId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }))
    throw new Error(err.error || 'delete_failed')
  }
  return res.json()
}

export async function createPost(data: { 
  title: string
  content: string
  authorId: string
  roomId: string
  category: string
  duration: string
  isVoiceNote?: boolean
}) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create post")
  return res.json()
}

export type ApiUser = { id: string; name: string; email: string }

export async function getUsers(): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE}/users`)
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function createUser(data: { name: string; email: string; password: string }): Promise<ApiUser> {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create user")
  return res.json()
}

export async function loginUser(data: { email: string; password: string }): Promise<ApiUser & { alias?: string | null; anonymousId?: string | null }> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }))
    throw new Error(err.error || 'login_failed')
  }
  return res.json()
}

export async function createAnonymous(): Promise<{ id: string | null; name: string; email: null; alias: string; anonymousId: string }> {
  const res = await fetch(`${API_BASE}/users/anonymous`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Failed to create anonymous user")
  return res.json()
}

// Rooms API
export async function getRooms(trending?: boolean): Promise<ApiRoom[]> {
  const url = trending !== undefined ? `${API_BASE}/rooms?trending=${trending}` : `${API_BASE}/rooms`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch rooms")
  return res.json()
}

export async function getRoom(roomId: string): Promise<ApiRoom & { recentPosts: ApiPost[] }> {
  const res = await fetch(`${API_BASE}/rooms/${roomId}`)
  if (!res.ok) throw new Error("Failed to fetch room")
  return res.json()
}

// Reactions API
export async function addReaction(postId: string, userId: string, reactionType: 'tea' | 'spicy' | 'cap' | 'hearts') {
  const res = await fetch(`${API_BASE}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, userId, reactionType }),
  })
  if (!res.ok) throw new Error("Failed to add reaction")
  return res.json()
}

export async function removeReaction(postId: string, userId: string, reactionType: 'tea' | 'spicy' | 'cap' | 'hearts') {
  const res = await fetch(`${API_BASE}/reactions`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, userId, reactionType }),
  })
  if (!res.ok) throw new Error("Failed to remove reaction")
  return res.json()
}

export async function getPostReactions(postId: string): Promise<{ reactions: ApiReaction; totalReactions: number }> {
  const res = await fetch(`${API_BASE}/reactions/${postId}`)
  if (!res.ok) throw new Error("Failed to fetch reactions")
  return res.json()
}


