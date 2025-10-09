import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, TrendingUp, Users, Clock, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { getRooms } from "@/lib/api"

// Rooms will be loaded from the API

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("")
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)

  // Load rooms on component mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await getRooms()
        setRooms(roomsData)
        setFilteredRooms(roomsData)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRooms()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredRooms(rooms)
    } else {
      setFilteredRooms(
        rooms.filter(room => 
          room.name.toLowerCase().includes(query.toLowerCase()) ||
          room.description.toLowerCase().includes(query.toLowerCase())
        )
      )
    }
  }

  const trendingRooms = rooms.filter(room => room.isTrending)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              Topic Rooms
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join themed rooms where the tea flows freely. Each room has its own vibe and community.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto animate-slide-in-right">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading rooms...</p>
            </div>
          )}

          {/* Trending Rooms */}
          {!loading && searchQuery === "" && (
            <section className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-semibold">Trending Now</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {trendingRooms.map((room, index) => (
                  <Card 
                    key={room.id} 
                    className="tea-card hover-lift cursor-pointer group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link to={`/rooms/${room.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 ${room.gradient} rounded-full flex items-center justify-center text-2xl shadow-glow`}>
                            {room.icon}
                          </div>
                          <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Hot
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {room.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm mb-4">
                          {room.description}
                        </CardDescription>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{room.memberCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{room.lastActivity}</span>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                          <div className="text-xs font-medium text-accent">
                            {room.recentPostCount} posts today
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* All Rooms */}
          {!loading && (
            <section className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {searchQuery ? `Search Results (${filteredRooms.length})` : "All Rooms"}
                </h2>
              </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <Card 
                  key={room.id} 
                  className="tea-card hover-lift cursor-pointer group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link to={`/rooms/${room.id}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 ${room.gradient} rounded-xl flex items-center justify-center text-3xl shadow-glow group-hover:animate-bounce-subtle`}>
                          {room.icon}
                        </div>
                        {room.trending && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {room.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {room.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-primary">
                            {room.memberCount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Members</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-accent">
                            {room.recentPostCount}
                          </div>
                          <div className="text-xs text-muted-foreground">Posts Today</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Active {room.lastActivity}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
                <p className="text-muted-foreground">
                  Try searching for different keywords or browse all rooms above.
                </p>
              </div>
            )}
            </section>
          )}

          {/* Create Room CTA */}
          {!loading && searchQuery === "" && (
            <Card className="tea-card gradient-hero text-center text-white animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="py-8">
                <h3 className="text-xl font-semibold mb-2">Can't find your vibe?</h3>
                <p className="text-white/90 mb-6">
                  Suggest a new topic room and help grow the TeaTok community
                </p>
                <Button variant="secondary" className="hover-scale shadow-soft">
                  Suggest a Room
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
