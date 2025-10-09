import { useState } from "react"
import { Edit2, Award, Clock, MessageCircle, TrendingUp, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/layout/navbar"

const badges = [
  {
    id: "1",
    name: "Tea Connoisseur",
    description: "Spilled 50+ posts that got major reactions",
    icon: "☕",
    earned: true,
    rarity: "rare"
  },
  {
    id: "2", 
    name: "Gossip Guru",
    description: "Master of celebrity drama and hot takes",
    icon: "👑",
    earned: true,
    rarity: "legendary"
  },
  {
    id: "3",
    name: "Movie Buff",
    description: "Expert reviewer in Movies room",
    icon: "🎬",
    earned: true,
    rarity: "common"
  },
  {
    id: "4",
    name: "Anonymous Legend",
    description: "Been active for 100+ days",
    icon: "👻",
    earned: false,
    rarity: "legendary"
  }
]

const recentPosts = [
  {
    id: "1",
    content: "That new superhero movie everyone's hyping... it's mid at best. The plot holes are bigger than the hero's ego.",
    category: "Movies",
    timestamp: "2h ago",
    reactions: 234,
    replies: 45,
    status: "active"
  },
  {
    id: "2",
    content: "Y'all the drama between those two TikTok stars is getting MESSY 🍿",
    category: "Celeb Gossip", 
    timestamp: "1d ago",
    reactions: 567,
    replies: 89,
    status: "active"
  },
  {
    id: "3",
    content: "Anyone else think that new battle royale is actually fire? Best mechanics in years.",
    category: "Gaming",
    timestamp: "3d ago",
    reactions: 156,
    replies: 23,
    status: "expired"
  }
]

export default function Profile() {
  const [currentAlias, setCurrentAlias] = useState("The Campus Oracle")
  const [isEditing, setIsEditing] = useState(false)

  const stats = {
    totalPosts: 147,
    totalReactions: 12567,
    topCategory: "Celeb Gossip",
    memberSince: "March 2024",
    streak: 23
  }

  const getBadgeRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary": return "gradient-primary"
      case "rare": return "gradient-accent" 
      case "common": return "gradient-warm"
      default: return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-4xl">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="tea-card animate-fade-in">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                    {currentAlias.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={currentAlias}
                        onChange={(e) => setCurrentAlias(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary text-center"
                      />
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="spill-button"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold">{currentAlias}</h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-8 w-8 hover-scale"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span>Anonymous ID: #T3A7OK</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Since {stats.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-in-right">
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{stats.totalPosts}</div>
                <div className="text-sm text-muted-foreground">Posts Spilled</div>
              </CardContent>
            </Card>
            
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent">{stats.totalReactions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Reactions</div>
              </CardContent>
            </Card>
            
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-tea-orange">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            
            <Card className="tea-card text-center">
              <CardContent className="p-4">
                <div className="text-sm font-bold text-tea-pink">{stats.topCategory}</div>
                <div className="text-sm text-muted-foreground">Top Category</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="badges" className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="posts">My Posts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {badges.map((badge, index) => (
                  <Card 
                    key={badge.id} 
                    className={`tea-card ${badge.earned ? 'shadow-glow' : 'opacity-60'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${getBadgeRarityColor(badge.rarity)} rounded-full flex items-center justify-center text-2xl shadow-glow`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{badge.name}</span>
                            {badge.earned && <Award className="h-4 w-4 text-accent" />}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getBadgeRarityColor(badge.rarity)} text-white border-0`}
                          >
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{badge.description}</CardDescription>
                      {!badge.earned && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Keep spilling tea to unlock this badge!
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {recentPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className={`tea-card ${post.status === 'expired' ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <Badge 
                          variant={post.status === 'active' ? 'default' : 'outline'}
                          className={post.status === 'active' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-accent">
                          <TrendingUp className="h-4 w-4" />
                          <span>{post.reactions}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </div>
                      </div>
                      
                      {post.status === 'active' && (
                        <Button variant="ghost" size="sm" className="hover-scale">
                          View Post
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="tea-card">
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>Your tea-spilling patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most Active Time</span>
                      <span className="text-sm font-medium">9-11 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Favorite Room</span>
                      <span className="text-sm font-medium">Celeb Gossip</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Reactions per Post</span>
                      <span className="text-sm font-medium">85.4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reply Rate</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="tea-card gradient-hero text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Keep the Tea Flowing!</h3>
                  <p className="text-white/90 mb-4">
                    You're doing great! Your posts generate {Math.round(stats.totalReactions / stats.totalPosts)} average reactions.
                  </p>
                  <Button variant="secondary" className="hover-scale shadow-soft">
                    Spill More Tea
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
