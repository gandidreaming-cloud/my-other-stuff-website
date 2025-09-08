import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Heart, MessageCircle, Share2, Clock, Trophy, Users, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [todayWinner, setTodayWinner] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());
  
  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Registration form
  const [regForm, setRegForm] = useState({
    name: "",
    email: ""
  });

  // Submission form
  const [subForm, setSubForm] = useState({
    text_content: "",
    instagram_link: "",
    tiktok_link: ""
  });

  // Comment form
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchTodayWinner();
    
    // Check if user is blocked (from localStorage)
    const blockUntil = localStorage.getItem('boringBlockUntil');
    if (blockUntil) {
      const blockTime = new Date(blockUntil);
      const now = new Date();
      if (now < blockTime) {
        const remaining = Math.ceil((blockTime - now) / 1000);
        setIsBlocked(true);
        setBlockTimeRemaining(remaining);
        setShowOnboarding(false);
        
        // Start countdown timer
        const timer = setInterval(() => {
          const currentTime = new Date();
          if (currentTime >= blockTime) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            setShowOnboarding(true);
            localStorage.removeItem('boringBlockUntil');
            clearInterval(timer);
          } else {
            const remaining = Math.ceil((blockTime - currentTime) / 1000);
            setBlockTimeRemaining(remaining);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem('boringBlockUntil');
      }
    }
  }, []);

  useEffect(() => {
    if (todayWinner) {
      fetchInteractions(todayWinner.id);
    }
  }, [todayWinner]);

  const fetchTodayWinner = async () => {
    try {
      const response = await axios.get(`${API}/today-winner`);
      setTodayWinner(response.data);
    } catch (error) {
      console.error("Error fetching today's winner:", error);
    }
  };

  const fetchInteractions = async (submissionId) => {
    try {
      const response = await axios.get(`${API}/submissions/${submissionId}/interactions`);
      setInteractions(response.data);
      
      // Track user likes
      if (currentUser) {
        const userLikeIds = new Set(
          response.data
            .filter(int => int.type === "like" && int.user_id === currentUser.id)
            .map(int => int.submission_id)
        );
        setUserLikes(userLikeIds);
      }
    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  };

  const fetchPendingSubmissions = async () => {
    if (!currentUser?.is_admin) return;
    try {
      const response = await axios.get(`${API}/submissions/pending`);
      setPendingSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
    }
  };

  const fetchAdminStats = async () => {
    if (!currentUser?.is_admin) return;
    try {
      const response = await axios.get(`${API}/admin/stats?admin_user_id=${currentUser.id}`);
      setAdminStats(response.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const handleBoringAnswer = (isBoring) => {
    if (isBoring) {
      setShowOnboarding(false);
      setShowRegistration(true);
    } else {
      // Block user for 10 minutes
      const blockUntil = new Date();
      blockUntil.setMinutes(blockUntil.getMinutes() + 10);
      localStorage.setItem('boringBlockUntil', blockUntil.toISOString());
      
      setIsBlocked(true);
      setBlockTimeRemaining(600); // 10 minutes in seconds
      setShowOnboarding(false);
      
      // Start countdown timer
      const timer = setInterval(() => {
        const currentTime = new Date();
        const blockTime = new Date(localStorage.getItem('boringBlockUntil'));
        
        if (currentTime >= blockTime) {
          setIsBlocked(false);
          setBlockTimeRemaining(0);
          setShowOnboarding(true);
          localStorage.removeItem('boringBlockUntil');
          clearInterval(timer);
        } else {
          const remaining = Math.ceil((blockTime - currentTime) / 1000);
          setBlockTimeRemaining(remaining);
        }
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/users`, regForm);
      setCurrentUser(response.data);
      setShowRegistration(false);
      toast.success("Welcome to Boring! You have 3 free tokens to start.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    }
  };

  const handleLogin = async (email) => {
    try {
      const response = await axios.get(`${API}/users/email/${email}`);
      setCurrentUser(response.data);
      toast.success(`Welcome back, ${response.data.name}!`);
    } catch (error) {
      toast.error("User not found. Please register first.");
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login or register first");
      return;
    }
    
    try {
      await axios.post(`${API}/submissions?user_id=${currentUser.id}`, subForm);
      setSubForm({ text_content: "", instagram_link: "", tiktok_link: "" });
      setShowSubmission(false);
      
      // Update user tokens
      const updatedUser = await axios.get(`${API}/users/${currentUser.id}`);
      setCurrentUser(updatedUser.data);
      
      toast.success("Your boring submission is awaiting approval!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Submission failed");
    }
  };

  const handleLike = async () => {
    if (!currentUser || !todayWinner) {
      toast.error("Please login to interact");
      return;
    }

    try {
      await axios.post(
        `${API}/submissions/${todayWinner.id}/interactions?user_id=${currentUser.id}`,
        { type: "like" }
      );
      
      // Refresh winner and interactions
      await fetchTodayWinner();
      await fetchInteractions(todayWinner.id);
      
      const isLiked = userLikes.has(todayWinner.id);
      toast.success(isLiked ? "Like removed" : "Liked!");
    } catch (error) {
      toast.error("Failed to like");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser || !todayWinner || !commentText.trim()) return;

    try {
      await axios.post(
        `${API}/submissions/${todayWinner.id}/interactions?user_id=${currentUser.id}`,
        { type: "comment", content: commentText }
      );
      
      setCommentText("");
      await fetchTodayWinner();
      await fetchInteractions(todayWinner.id);
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleApproveSubmission = async (submissionId, status) => {
    try {
      await axios.put(
        `${API}/submissions/${submissionId}/status?admin_user_id=${currentUser.id}`,
        { status }
      );
      
      await fetchPendingSubmissions();
      toast.success(`Submission ${status}`);
    } catch (error) {
      toast.error("Failed to update submission");
    }
  };

  const runLottery = async () => {
    try {
      const response = await axios.post(`${API}/run-lottery?admin_user_id=${currentUser.id}`);
      toast.success(response.data.message);
      await fetchTodayWinner();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to run lottery");
    }
  };

  const makeAdmin = async () => {
    if (!currentUser) return;
    try {
      await axios.post(`${API}/admin/make-admin?user_id=${currentUser.id}`);
      const updatedUser = await axios.get(`${API}/users/${currentUser.id}`);
      setCurrentUser(updatedUser.data);
      toast.success("You are now an admin!");
    } catch (error) {
      toast.error("Failed to make admin");
    }
  };

  // Onboarding Question Screen
  if (showOnboarding && !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-md text-center">
          <div className="mb-10">
            <h1 className="text-6xl font-light text-black mb-2">boooring</h1>
            <p className="text-xl text-black">ordinary is extraordinary</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl text-black mb-2">are you boring?</h2>
            
            <div className="flex justify-center gap-6">
              <Button 
                onClick={() => handleBoringAnswer(true)}
                className="px-6 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                yes
              </Button>
              <Button 
                onClick={() => handleBoringAnswer(false)}
                className="px-6 py-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                no
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Block Screen
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-light text-black mb-2">boooring</h1>
            <p className="text-xl text-black mb-6">ordinary is extraordinary</p>
          </div>
          
          <div className="space-y-6">
            <p className="text-lg text-black leading-relaxed">
              Sorry, but you are not boring enough to use this site.<br />
              Reflect on your behavior — you have {formatTime(blockTimeRemaining)}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration Screen
  if (showRegistration && !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-light text-black mb-2">boooring</h1>
            <p className="text-xl text-black mb-6">ordinary is extraordinary</p>
          </div>
          
          <div className="w-full max-w-lg">
            <form onSubmit={handleRegistration} className="space-y-3">
              <div className="flex items-center gap-6">
                <Label htmlFor="name" className="text-black font-medium w-32 text-right">Nickname:</Label>
                <Input
                  id="name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                  className="flex-1 border-black focus:border-black focus:ring-black"
                  required
                />
              </div>
              
              <div className="flex items-center gap-6">
                <Label htmlFor="email" className="text-black font-medium w-32 text-right">Email:</Label>
                <Input
                  id="email"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                  className="flex-1 border-black focus:border-black focus:ring-black"
                  required
                />
              </div>
              
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit"
                  className="px-12 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main App (logged in users)
  if (currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster />
        
        {/* Header */}
        <header className="bg-white border-b border-black sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-light text-black">boooring</h1>
              <Badge variant="outline" className="bg-white text-black border-black">
                <Clock className="w-3 h-3 mr-1" />
                Daily Winner at 4PM Berlin
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-black">
                <span className="font-medium">{currentUser.name}</span>
                <Badge className="ml-2 bg-black text-white">
                  {currentUser.tokens_remaining} tokens
                </Badge>
                {currentUser.is_admin && (
                  <Badge className="ml-2 bg-black text-white">Admin</Badge>
                )}
              </div>
              
              <Button 
                onClick={() => setShowSubmission(true)} 
                disabled={currentUser.tokens_remaining <= 0}
                size="sm"
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                Submit Boring Content
              </Button>
              
              {currentUser.is_admin && (
                <Button 
                  onClick={() => setShowAdmin(true)} 
                  variant="outline" 
                  size="sm"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  Admin Panel
                </Button>
              )}
              
              {!currentUser.is_admin && (
                <Button 
                  onClick={makeAdmin} 
                  variant="ghost" 
                  size="sm"
                  className="text-black hover:bg-black hover:text-white"
                >
                  Become Admin
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6">
          {/* Today's Winner */}
          {todayWinner ? (
            <Card className="mb-8 border-2 border-black bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-black" />
                  <CardTitle className="text-black">Today's Boring Winner</CardTitle>
                  <Badge className="bg-black text-white">
                    {new Date(todayWinner.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border border-black rounded-lg p-4">
                  <p className="text-lg leading-relaxed text-black mb-4">
                    {todayWinner.text_content}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {todayWinner.instagram_link && (
                      <a 
                        href={todayWinner.instagram_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-black hover:underline font-medium"
                      >
                        📸 Instagram
                      </a>
                    )}
                    {todayWinner.tiktok_link && (
                      <a 
                        href={todayWinner.tiktok_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-black hover:underline font-medium"
                      >
                        🎵 TikTok
                      </a>
                    )}
                  </div>
                  
                  <div className="text-sm text-black mb-4">
                    By <span className="font-medium">{todayWinner.user_name}</span>
                  </div>
                </div>
                
                {/* Interaction Buttons */}
                <div className="flex gap-4 items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:bg-black hover:text-white ${userLikes.has(todayWinner.id) ? 'text-black' : 'text-black'}`}
                  >
                    <Heart className={`w-4 h-4 ${userLikes.has(todayWinner.id) ? 'fill-current' : ''}`} />
                    {todayWinner.likes_count}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-black hover:bg-black hover:text-white">
                    <MessageCircle className="w-4 h-4" />
                    {todayWinner.comments_count}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-black hover:bg-black hover:text-white">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
                
                {/* Comments Section */}
                <div className="space-y-4">
                  <form onSubmit={handleComment} className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a supportive comment..."
                      className="flex-1 border-black focus:border-black focus:ring-black"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                    >
                      Comment
                    </Button>
                  </form>
                  
                  <div className="space-y-2">
                    {interactions
                      .filter(int => int.type === "comment")
                      .map(comment => (
                        <div key={comment.id} className="bg-white border border-black rounded p-3">
                          <div className="font-medium text-sm text-black">{comment.user_name}</div>
                          <div className="text-black">{comment.content}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 text-center py-12 border-black">
              <CardContent>
                <Clock className="w-12 h-12 text-black mx-auto mb-4" />
                <h2 className="text-2xl font-light text-black mb-2">No Winner Yet Today</h2>
                <p className="text-black">The daily lottery runs at 4PM Berlin time</p>
                {currentUser.is_admin && (
                  <Button 
                    onClick={runLottery} 
                    className="mt-4 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    Run Lottery Now (Admin)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Trophy className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-black space-y-2">
                <p>• Submit your most boring moment using a token</p>
                <p>• Admin reviews and approves submissions</p>
                <p>• One random winner chosen daily at 4PM Berlin time</p>
                <p>• Everyone can like, comment, and share the winner</p>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="w-5 h-5" />
                  Community Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-black space-y-2">
                <p>• Celebrate the ordinary and mundane</p>
                <p>• No judgment, only support</p>
                <p>• Keep it boring and wholesome</p>
                <p>• Share your everyday moments</p>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <FileText className="w-5 h-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-black space-y-2">
                <p>Tokens remaining: <span className="font-bold">{currentUser.tokens_remaining}</span></p>
                <p>Member since: {new Date(currentUser.created_at).toLocaleDateString()}</p>
                <p>Boring level: <span className="font-bold">Maximum</span></p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submission Dialog */}
        <Dialog open={showSubmission} onOpenChange={setShowSubmission}>
          <DialogContent className="max-w-md border-black">
            <DialogHeader>
              <DialogTitle className="text-black">Submit Your Boring Moment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmission} className="space-y-4">
              <div>
                <Label htmlFor="text-content" className="text-black">Your boring story (max 1000 characters)</Label>
                <Textarea
                  id="text-content"
                  value={subForm.text_content}
                  onChange={(e) => setSubForm({...subForm, text_content: e.target.value})}
                  placeholder="I organized my pencils by color today..."
                  className="min-h-[100px] border-black focus:border-black focus:ring-black"
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-black mt-1">
                  {subForm.text_content.length}/1000 characters
                </div>
              </div>
              
              <div>
                <Label htmlFor="instagram" className="text-black">Instagram Link (optional)</Label>
                <Input
                  id="instagram"
                  value={subForm.instagram_link}
                  onChange={(e) => setSubForm({...subForm, instagram_link: e.target.value})}
                  placeholder="https://instagram.com/..."
                  className="border-black focus:border-black focus:ring-black"
                />
              </div>
              
              <div>
                <Label htmlFor="tiktok" className="text-black">TikTok Link (optional)</Label>
                <Input
                  id="tiktok"
                  value={subForm.tiktok_link}
                  onChange={(e) => setSubForm({...subForm, tiktok_link: e.target.value})}
                  placeholder="https://tiktok.com/..."
                  className="border-black focus:border-black focus:ring-black"
                />
              </div>
              
              <div className="bg-white border border-black p-3 rounded-lg text-sm text-black">
                This will use 1 token. You have {currentUser.tokens_remaining} tokens remaining.
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white" 
                disabled={currentUser.tokens_remaining <= 0}
              >
                Submit for Daily Lottery
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin Panel */}
        <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-black">
            <DialogHeader>
              <DialogTitle className="text-black">Admin Panel</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="pending" onValueChange={(tab) => {
              if (tab === "pending") fetchPendingSubmissions();
              if (tab === "stats") fetchAdminStats();
            }}>
              <TabsList>
                <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
                {pendingSubmissions.map(submission => (
                  <Card key={submission.id} className="border-black">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-black">{submission.user_name}</div>
                          <div className="text-sm text-black">
                            {new Date(submission.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveSubmission(submission.id, "approved")}
                            className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApproveSubmission(submission.id, "rejected")}
                            className="border-black text-black hover:bg-black hover:text-white"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                      
                      <p className="mb-3 text-black">{submission.text_content}</p>
                      
                      {(submission.instagram_link || submission.tiktok_link) && (
                        <div className="flex gap-3 text-sm">
                          {submission.instagram_link && (
                            <a href={submission.instagram_link} target="_blank" rel="noopener noreferrer" 
                               className="text-black hover:underline">Instagram</a>
                          )}
                          {submission.tiktok_link && (
                            <a href={submission.tiktok_link} target="_blank" rel="noopener noreferrer" 
                               className="text-black hover:underline">TikTok</a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {pendingSubmissions.length === 0 && (
                  <div className="text-center py-8 text-black">
                    No pending submissions
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-black">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-black">{adminStats.total_users}</div>
                      <div className="text-sm text-black">Total Users</div>
                    </CardContent>
                  </Card>
                  <Card className="border-black">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-black">{adminStats.total_submissions}</div>
                      <div className="text-sm text-black">Total Submissions</div>
                    </CardContent>
                  </Card>
                  <Card className="border-black">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-black">{adminStats.pending_submissions}</div>
                      <div className="text-sm text-black">Pending Review</div>
                    </CardContent>
                  </Card>
                  <Card className="border-black">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-black">{adminStats.approved_submissions}</div>
                      <div className="text-sm text-black">Approved</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="actions">
                <div className="space-y-4">
                  <Card className="border-black">
                    <CardContent className="pt-4">
                      <h3 className="font-medium mb-2 text-black">Daily Lottery</h3>
                      <p className="text-sm text-black mb-4">
                        Manually trigger the daily winner selection
                      </p>
                      <Button 
                        onClick={runLottery}
                        className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                      >
                        Run Lottery Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-light text-black mb-2">boooring</h1>
          <p className="text-xl text-black">ordinary is extraordinary</p>
        </div>
        
        <p className="text-black">Please refresh the page to start again.</p>
      </div>
    </div>
  );
}

export default App;