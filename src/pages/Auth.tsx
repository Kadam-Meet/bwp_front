import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Ghost, Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createUser as apiCreateUser, loginUser as apiLoginUser, createAnonymous as apiCreateAnonymous } from "@/lib/api"

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent, type: 'signin' | 'signup' | 'anonymous') => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      const email = String(formData.get('email') || '').trim()
      const password = String(formData.get('password') || '').trim()
      const name = String(formData.get('name') || '').trim()

      if (type !== 'anonymous') {
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        if (!isEmailValid) {
          throw new Error('invalid_email')
        }
        if (password.length < 6) {
          throw new Error('weak_password')
        }
      }

      let userSession: any
      if (type === 'signup') {
        const displayName = name || email.split('@')[0]
        userSession = await apiCreateUser({ name: displayName, email, password })
      } else if (type === 'signin') {
        userSession = await apiLoginUser({ email, password })
      } else {
        userSession = await apiCreateAnonymous()
      }

      localStorage.setItem('teatok_user', JSON.stringify({
        id: userSession.id ?? null,
        name: userSession.name ?? userSession.alias,
        email: userSession.email ?? null,
        alias: userSession.alias ?? null,
        anonymousId: userSession.anonymousId ?? null,
        isAnonymous: type === 'anonymous',
      }))
      if (userSession.id) {
        localStorage.setItem('userId', String(userSession.id))
      }
      if (userSession.anonymousId) {
        localStorage.setItem('anonymousUserId', String(userSession.anonymousId))
      }

      toast({
        title: type === 'anonymous' ? 'Welcome, Anonymous!' : 'Welcome to TeaTok!',
        description: type === 'anonymous' ? "You're now browsing anonymously. Start spilling some tea!" : 'Ready to spill some tea?',
      })
      navigate('/feed')
    } catch (err: any) {
      const code = err?.message || 'auth_error'
      let description = 'Something went wrong. Please try again.'
      if (code === 'invalid_email') description = 'Please enter a valid email address.'
      if (code === 'weak_password') description = 'Password must be at least 6 characters.'
      if (code === 'email already exists' || code === 'conflict' || code === '409') description = 'This email is already registered.'
      if (code === 'invalid_credentials') description = 'Incorrect email or password.'
      toast({ title: 'Authentication failed', description, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center">
            <div className="relative">
              <img src="/logo.png" alt="TeaTok Logo" className="hidden dark:block h-20 w-20 md:h-24 md:w-24 animate-pulse-glow rounded object-contain" />
              <img src="/logo-light.png" alt="TeaTok Logo" className="block dark:hidden h-20 w-20 md:h-24 md:w-24 animate-pulse-glow rounded object-contain" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              Welcome to TeaTok
            </h1>
            <p className="text-muted-foreground">
              Spill anonymously, connect authentically
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="tea-card">
          <Tabs defaultValue="signin">
            <CardHeader className="space-y-1 pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={(e) => handleSubmit(e, 'signin')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Input
                        name="email"
                        type="email"
                        placeholder="spill@teatime.com"
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your secret brew..."
                        className="pl-10 pr-10"
                        required
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full spill-button" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Brewing..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleSubmit(e, 'signup')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <div className="relative">
                      <Input
                        name="name"
                        type="text"
                        placeholder="Your display name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Input
                        name="email"
                        type="email"
                        placeholder="newbie@teatime.com"
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create your secret..."
                        className="pl-10 pr-10"
                        required
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full spill-button" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Brewing..." : "Join TeaTok"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Anonymous Option */}
        <Card className="tea-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-lg">
              <Ghost className="h-5 w-5 text-accent" />
              <span>Go Anonymous</span>
            </CardTitle>
            <CardDescription>
              Explore TeaTok without creating an account
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={(e) => handleSubmit(e as any, 'anonymous')}
              variant="outline" 
              className="w-full neon-border hover-glow"
              disabled={isLoading}
            >
              <Ghost className="h-4 w-4 mr-2" />
              {isLoading ? "Materializing..." : "Browse Anonymously"}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to TeaTok's{" "}
          <Link to="/about" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/about" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}