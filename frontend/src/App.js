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

  // Registration form
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    boring_answer: ""
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

  const LoginForm = () => {
    const [email, setEmail] = useState("");
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login to Boring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <Button onClick={() => handleLogin(email)} className="w-full">
            Login
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRegistration(true)}
            className="w-full"
          >
            Register Instead
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-amber-900 mb-4">Boring</h1>
            <p className="text-xl text-amber-700 mb-2">Where ordinary is extraordinary</p>
            <p className="text-amber-600">Share your most mundane moments without judgment</p>
          </div>
          
          <LoginForm />
          
          {/* Registration Dialog */}
          <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join the Boring Community</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={regForm.name}
                    onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="boring-answer">Are you boring enough?</Label>
                  <Textarea
                    id="boring-answer"
                    value={regForm.boring_answer}
                    onChange={(e) => setRegForm({...regForm, boring_answer: e.target.value})}
                    placeholder="Tell us why you're perfectly, wonderfully boring..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Join the Boring Club</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-amber-900">Boring</h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              <Clock className="w-3 h-3 mr-1" />
              Daily Winner at 4PM Berlin
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-amber-700">
              <span className="font-medium">{currentUser.name}</span>
              <Badge className="ml-2 bg-amber-200 text-amber-800">
                {currentUser.tokens_remaining} tokens
              </Badge>
              {currentUser.is_admin && (
                <Badge className="ml-2 bg-blue-500 text-white">Admin</Badge>
              )}
            </div>
            
            <Button 
              onClick={() => setShowSubmission(true)} 
              disabled={currentUser.tokens_remaining <= 0}
              size="sm"
            >
              Submit Boring Content
            </Button>
            
            {currentUser.is_admin && (
              <Button onClick={() => setShowAdmin(true)} variant="outline" size="sm">
                Admin Panel
              </Button>
            )}
            
            {!currentUser.is_admin && (
              <Button onClick={makeAdmin} variant="ghost" size="sm">
                Become Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Today's Winner */}
        {todayWinner ? (
          <Card className="mb-8 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-600" />
                <CardTitle className="text-amber-900">Today's Boring Winner</CardTitle>
                <Badge className="bg-amber-200 text-amber-800">
                  {new Date(todayWinner.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/60 rounded-lg p-4">
                <p className="text-lg leading-relaxed text-gray-800 mb-4">
                  {todayWinner.text_content}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {todayWinner.instagram_link && (
                    <a 
                      href={todayWinner.instagram_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 font-medium"
                    >
                      📸 Instagram
                    </a>
                  )}
                  {todayWinner.tiktok_link && (
                    <a 
                      href={todayWinner.tiktok_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-800 font-medium"
                    >
                      🎵 TikTok
                    </a>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  By <span className="font-medium">{todayWinner.user_name}</span>
                </div>
              </div>
              
              {/* Interaction Buttons */}
              <div className="flex gap-4 items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${userLikes.has(todayWinner.id) ? 'text-red-600' : 'text-gray-600'}`}
                >
                  <Heart className={`w-4 h-4 ${userLikes.has(todayWinner.id) ? 'fill-current' : ''}`} />
                  {todayWinner.likes_count}
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  {todayWinner.comments_count}
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
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
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">Comment</Button>
                </form>
                
                <div className="space-y-2">
                  {interactions
                    .filter(int => int.type === "comment")
                    .map(comment => (
                      <div key={comment.id} className="bg-white/60 rounded p-3">
                        <div className="font-medium text-sm text-amber-800">{comment.user_name}</div>
                        <div className="text-gray-700">{comment.content}</div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 text-center py-12">
            <CardContent>
              <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">No Winner Yet Today</h2>
              <p className="text-amber-700">The daily lottery runs at 4PM Berlin time</p>
              {currentUser.is_admin && (
                <Button onClick={runLottery} className="mt-4">
                  Run Lottery Now (Admin)
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Trophy className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Submit your most boring moment using a token</p>
              <p>• Admin reviews and approves submissions</p>
              <p>• One random winner chosen daily at 4PM Berlin time</p>
              <p>• Everyone can like, comment, and share the winner</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Users className="w-5 h-5" />
                Community Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Celebrate the ordinary and mundane</p>
              <p>• No judgment, only support</p>
              <p>• Keep it boring and wholesome</p>
              <p>• Share your everyday moments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <FileText className="w-5 h-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>Tokens remaining: <span className="font-bold">{currentUser.tokens_remaining}</span></p>
              <p>Member since: {new Date(currentUser.created_at).toLocaleDateString()}</p>
              <p>Boring level: <span className="font-bold">Maximum</span></p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={showSubmission} onOpenChange={setShowSubmission}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Your Boring Moment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmission} className="space-y-4">
            <div>
              <Label htmlFor="text-content">Your boring story (max 1000 characters)</Label>
              <Textarea
                id="text-content"
                value={subForm.text_content}
                onChange={(e) => setSubForm({...subForm, text_content: e.target.value})}
                placeholder="I organized my pencils by color today..."
                className="min-h-[100px]"
                maxLength={1000}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {subForm.text_content.length}/1000 characters
              </div>
            </div>
            
            <div>
              <Label htmlFor="instagram">Instagram Link (optional)</Label>
              <Input
                id="instagram"
                value={subForm.instagram_link}
                onChange={(e) => setSubForm({...subForm, instagram_link: e.target.value})}
                placeholder="https://instagram.com/..."
              />
            </div>
            
            <div>
              <Label htmlFor="tiktok">TikTok Link (optional)</Label>
              <Input
                id="tiktok"
                value={subForm.tiktok_link}
                onChange={(e) => setSubForm({...subForm, tiktok_link: e.target.value})}
                placeholder="https://tiktok.com/..."
              />
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
              This will use 1 token. You have {currentUser.tokens_remaining} tokens remaining.
            </div>
            
            <Button type="submit" className="w-full" disabled={currentUser.tokens_remaining <= 0}>
              Submit for Daily Lottery
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Panel */}
      <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Panel</DialogTitle>
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
                <Card key={submission.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{submission.user_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveSubmission(submission.id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleApproveSubmission(submission.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                    
                    <p className="mb-3">{submission.text_content}</p>
                    
                    {(submission.instagram_link || submission.tiktok_link) && (
                      <div className="flex gap-3 text-sm">
                        {submission.instagram_link && (
                          <a href={submission.instagram_link} target="_blank" rel="noopener noreferrer" 
                             className="text-pink-600">Instagram</a>
                        )}
                        {submission.tiktok_link && (
                          <a href={submission.tiktok_link} target="_blank" rel="noopener noreferrer" 
                             className="text-black">TikTok</a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {pendingSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending submissions
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{adminStats.total_users}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{adminStats.total_submissions}</div>
                    <div className="text-sm text-gray-600">Total Submissions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{adminStats.pending_submissions}</div>
                    <div className="text-sm text-gray-600">Pending Review</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{adminStats.approved_submissions}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="actions">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-2">Daily Lottery</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Manually trigger the daily winner selection
                    </p>
                    <Button onClick={runLottery}>Run Lottery Now</Button>
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

export default App;