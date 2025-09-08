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
  const [blockMessage, setBlockMessage] = useState("");

  // Block messages array
  const blockMessages = [
    "you're not boring enough. reflect on that and return in 10 minutes.",
    "sorry, your boredom levels are too low. please try again in 10 minutes.",
    "you're a bit too exciting right now. cool down for 10 minutes.",
    "this site is for boring people only. take 10 minutes to reconsider.",
    "you don't qualify as boring yet. come back in 10 minutes.",
    "please reflect on your lack of boredom and retry in 10 minutes.",
    "your excitement is showing. hide it and return in 10 minutes.",
    "we require more dullness. try again in 10 minutes.",
    "sorry, you're too lively. timeout: 10 minutes.",
    "come back in 10 minutes when you're properly boring.",
    "your behavior is suspiciously interesting. revisit us in 10 minutes.",
    "boring people only beyond this point. wait 10 minutes.",
    "too much fun detected. lockout: 10 minutes.",
    "rethink your energy. you may return in 10 minutes.",
    "not boring enough — yet. check back in 10 minutes.",
    "you're too vibrant. take a 10-minute pause.",
    "please dull your sparkle. come back after 10 minutes.",
    "excitement isn't allowed. wait 10 minutes to continue.",
    "your boredom score is too low. retry in 10 minutes.",
    "take 10 minutes to practice being boring.",
    "boring level: insufficient. retry later.",
    "fun detected. come back in 10 minutes.",
    "you need to calm down. return in 10 minutes.",
    "please tone it down. 10-minute lock.",
    "your vibe is too thrilling. wait 10 minutes.",
    "suspicious enthusiasm spotted. timeout: 10 minutes.",
    "this is a boring zone only. retry in 10 minutes.",
    "energy levels are too high. reset in 10 minutes.",
    "you're too colorful for this space. come back in 10 minutes.",
    "please reconsider your liveliness. 10 minutes.",
    "too much fun in your system. wait 10 minutes.",
    "your boring credentials are under review. 10 minutes required.",
    "calm yourself. you may return in 10 minutes.",
    "interesting people not allowed. see us in 10 minutes.",
    "too much personality. cool-off: 10 minutes.",
    "you must reach maximum boredom. retry in 10 minutes.",
    "your excitement disqualifies you. 10 minutes pause.",
    "we only admit dullness. retry in 10 minutes.",
    "please suppress your fun. return in 10 minutes.",
    "joy is not permitted. take 10 minutes.",
    "too spicy. wait 10 minutes.",
    "enthusiasm alert! cool-off: 10 minutes.",
    "rethink your choices. come back later.",
    "not enough yawn potential. try again in 10 minutes.",
    "this site needs monotony. pause 10 minutes.",
    "too thrilling to enter. retry in 10 minutes.",
    "dull down, then return in 10 minutes.",
    "sorry, we only serve the bored. 10 minutes required.",
    "your boredom license is pending. wait 10 minutes.",
    "pause your fun. reapply in 10 minutes.",
    "too exciting for now. see you in 10 minutes.",
    "interesting behavior detected. blocked 10 minutes.",
    "please act less cool. return in 10 minutes.",
    "we require peak dullness. try later.",
    "chill out for 10 minutes.",
    "revisit your choices. 10 minutes off.",
    "excitement is forbidden. wait 10 minutes.",
    "your boredom rating is too low. retry later.",
    "relax harder. come back in 10 minutes.",
    "boring mode unavailable. retry later.",
    "too curious. timeout: 10 minutes.",
    "please reduce your shine. retry in 10 minutes.",
    "spark detected. cooling for 10 minutes.",
    "the boring gate is closed. wait 10 minutes.",
    "your vibe is too bright. return later.",
    "this system rejects excitement. 10 minutes lock.",
    "be duller. retry later.",
    "please embrace monotony. 10 minutes.",
    "interesting activity blocked. retry in 10.",
    "sorry, we only take snoozers. wait 10 minutes.",
    "pause and reflect. retry later.",
    "your fun is a problem. cool-off: 10 minutes.",
    "not bland enough. try again in 10 minutes.",
    "dullness required. retry later.",
    "too spicy. blocked for 10 minutes.",
    "you're not boring. we need boring. retry later.",
    "enthusiasm overload. cooling.",
    "take 10 minutes to meditate on boredom.",
    "think boring thoughts. try again soon.",
    "too alive right now. retry in 10.",
    "you're interesting. that's not allowed. wait 10.",
    "neutralize your energy. return later.",
    "pause fun mode. retry in 10 minutes.",
    "boring required, fun denied. 10 minutes.",
    "suspicious activity: fun. blocked 10 minutes.",
    "sorry, excitement violates the rules. retry later.",
    "try dullness practice. come back in 10 minutes.",
    "your personality is too strong. wait 10 minutes.",
    "the boring meter is too low. retry in 10.",
    "timeout for enthusiasm. 10 minutes.",
    "you're too cool. retry later.",
    "this site needs snoozers. 10 minutes block.",
    "you're too awake. try again soon.",
    "please enter in dull mode. retry in 10.",
    "your vibe is disqualified. wait 10 minutes.",
    "chill vibes required. come back later.",
    "not boring = not welcome. retry later.",
    "excitement alert! reset in 10 minutes.",
    "too interesting for our taste. try again later.",
    "come back when you're boring enough. 10 minutes."
  ];

  // Registration form
  const [regForm, setRegForm] = useState({
    nickname: "",
    email: ""
  });

  // Login form  
  const [loginForm, setLoginForm] = useState({
    nickname: "",
    magic_word: ""
  });

  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [magicWord, setMagicWord] = useState("");
  const [showLogin, setShowLogin] = useState(false);

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
    
    // Check for saved user session
    const savedUser = localStorage.getItem('boringUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const expiryDate = new Date(userData.session_expires);
        const now = new Date();
        
        if (now < expiryDate) {
          // Session still valid
          setCurrentUser(userData);
          setShowOnboarding(false);
          setShowRegistration(false);
          setShowLogin(false);
        } else {
          // Session expired
          localStorage.removeItem('boringUser');
        }
      } catch (error) {
        localStorage.removeItem('boringUser');
      }
    }
    
    // Check if user is blocked (from localStorage)
    const blockUntil = localStorage.getItem('boringBlockUntil');
    const savedBlockMessage = localStorage.getItem('boringBlockMessage');
    if (blockUntil && !savedUser) { // Only show block if not logged in
      const blockTime = new Date(blockUntil);
      const now = new Date();
      if (now < blockTime) {
        const remaining = Math.ceil((blockTime - now) / 1000);
        setIsBlocked(true);
        setBlockTimeRemaining(remaining);
        setBlockMessage(savedBlockMessage || blockMessages[0]);
        setShowOnboarding(false);
        
        // Start countdown timer
        const timer = setInterval(() => {
          const currentTime = new Date();
          if (currentTime >= blockTime) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            setBlockMessage("");
            setShowOnboarding(true);
            localStorage.removeItem('boringBlockUntil');
            localStorage.removeItem('boringBlockMessage');
            clearInterval(timer);
          } else {
            const remaining = Math.ceil((blockTime - currentTime) / 1000);
            setBlockTimeRemaining(remaining);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem('boringBlockUntil');
        localStorage.removeItem('boringBlockMessage');
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
      // Select random block message
      const randomMessage = blockMessages[Math.floor(Math.random() * blockMessages.length)];
      setBlockMessage(randomMessage);
      
      // Block user for 10 minutes
      const blockUntil = new Date();
      blockUntil.setMinutes(blockUntil.getMinutes() + 10);
      localStorage.setItem('boringBlockUntil', blockUntil.toISOString());
      localStorage.setItem('boringBlockMessage', randomMessage);
      
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
          setBlockMessage("");
          setShowOnboarding(true);
          localStorage.removeItem('boringBlockUntil');
          localStorage.removeItem('boringBlockMessage');
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
      const response = await axios.post(`${API}/register`, regForm);
      setMagicWord(response.data.magic_word);
      setRegistrationSuccess(true);
      toast.success("registration successful!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/login`, loginForm);
      const user = response.data;
      
      // Save session for 90 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);
      
      const sessionData = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        tokens_remaining: user.tokens_remaining,
        is_admin: user.is_admin,
        created_at: user.created_at,
        session_expires: expiryDate.toISOString()
      };
      
      localStorage.setItem('boringUser', JSON.stringify(sessionData));
      setCurrentUser(sessionData);
      setShowLogin(false);
      setShowRegistration(false);
      setShowOnboarding(false);
      
      toast.success(`welcome back, ${user.nickname}!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "login failed");
    }
  };

  const handleContinueToBoring = () => {
    setRegistrationSuccess(false);
    setShowRegistration(false);
    setShowLogin(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("magic word copied!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("magic word copied!");
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

  const handleLogout = () => {
    localStorage.removeItem('boringUser');
    setCurrentUser(null);
    setShowOnboarding(true);
    setShowRegistration(false);
    setShowLogin(false);
    toast.success("logged out successfully");
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
            
            <div className="flex justify-center gap-3">
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
              {blockMessage}<br />
              you have {formatTime(blockTimeRemaining)}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration Success Screen
  if (registrationSuccess && !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-light text-black mb-2">boooring</h1>
            <p className="text-xl text-black mb-6">ordinary is extraordinary</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl text-black mb-4">✅ registration successful!</h2>
              
              <p className="text-black mb-4">your magic word is:</p>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 bg-gray-50 border-2 border-black rounded p-3 font-mono text-lg text-black break-all">
                  {magicWord}
                </div>
                <Button
                  onClick={() => copyToClipboard(magicWord)}
                  className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  📋 copy
                </Button>
              </div>
              
              <p className="text-sm text-black mb-6">
                💾 save this word to log in later
              </p>
              
              <Button
                onClick={handleContinueToBoring}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                continue to boooring
              </Button>
            </div>
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
                <Label htmlFor="nickname" className="text-black font-medium w-32 text-right">nickname:</Label>
                <Input
                  id="nickname"
                  value={regForm.nickname}
                  onChange={(e) => setRegForm({...regForm, nickname: e.target.value})}
                  className="flex-1 border-black focus:border-black focus:ring-black"
                  required
                />
              </div>
              
              <div className="flex items-center gap-6">
                <Label htmlFor="email" className="text-black font-medium w-32 text-right">email:</Label>
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
            
            <div className="text-center mt-4">
              <Button
                onClick={() => {setShowRegistration(false); setShowLogin(true);}}
                variant="ghost"
                className="text-black hover:bg-black hover:text-white"
              >
                already have account? login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (showLogin && !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-light text-black mb-2">boooring</h1>
            <p className="text-xl text-black mb-6">ordinary is extraordinary</p>
          </div>
          
          <div className="w-full max-w-lg">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="flex items-center gap-6">
                <Label htmlFor="login-nickname" className="text-black font-medium w-32 text-right">nickname:</Label>
                <Input
                  id="login-nickname"
                  value={loginForm.nickname}
                  onChange={(e) => setLoginForm({...loginForm, nickname: e.target.value})}
                  className="flex-1 border-black focus:border-black focus:ring-black"
                  required
                />
              </div>
              
              <div className="flex items-center gap-6">
                <Label htmlFor="magic-word" className="text-black font-medium w-32 text-right">magic word:</Label>
                <Input
                  id="magic-word"
                  value={loginForm.magic_word}
                  onChange={(e) => setLoginForm({...loginForm, magic_word: e.target.value})}
                  className="flex-1 border-black focus:border-black focus:ring-black font-mono"
                  placeholder="rrriiinnngggooobbbo"
                  required
                />
              </div>
              
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit"
                  className="px-12 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  login
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <Button
                onClick={() => {setShowLogin(false); setShowRegistration(true);}}
                variant="ghost"
                className="text-black hover:bg-black hover:text-white"
              >
                need account? register
              </Button>
            </div>
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
                <span className="font-medium">{currentUser.nickname}</span>
                <Badge className="ml-2 bg-black text-white">
                  {currentUser.tokens_remaining} tokens
                </Badge>
                {currentUser.is_admin && (
                  <Badge className="ml-2 bg-black text-white">admin</Badge>
                )}
              </div>
              
              <Button 
                onClick={() => setShowSubmission(true)} 
                disabled={currentUser.tokens_remaining <= 0}
                size="sm"
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                submit boring content
              </Button>
              
              {currentUser.is_admin && (
                <Button 
                  onClick={() => setShowAdmin(true)} 
                  variant="outline" 
                  size="sm"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  admin panel
                </Button>
              )}
              
              {/* Remove "Become Admin" button - admin access restricted to owner only */}
              
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                size="sm"
                className="text-black hover:bg-black hover:text-white"
              >
                logout
              </Button>
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
                  <CardTitle className="text-black">today's boring winner</CardTitle>
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
                    by <span className="font-medium">{todayWinner.user_nickname}</span>
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
                    share
                  </Button>
                </div>
                
                {/* Comments Section */}
                <div className="space-y-4">
                  <form onSubmit={handleComment} className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="add a supportive comment..."
                      className="flex-1 border-black focus:border-black focus:ring-black"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                    >
                      comment
                    </Button>
                  </form>
                  
                  <div className="space-y-2">
                    {interactions
                      .filter(int => int.type === "comment")
                      .map(comment => (
                        <div key={comment.id} className="bg-white border border-black rounded p-3">
                          <div className="font-medium text-sm text-black">{comment.user_nickname}</div>
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
                <h2 className="text-2xl font-light text-black mb-2">no winner yet today</h2>
                <p className="text-black">the daily lottery runs at 4pm berlin time</p>
                {currentUser.is_admin && (
                  <Button 
                    onClick={runLottery} 
                    className="mt-4 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    run lottery now (admin)
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
                  how it works
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-black space-y-2">
                <p>• submit your most boring moment using a token</p>
                <p>• admin reviews and approves submissions</p>
                <p>• one random winner chosen daily at 4pm berlin time</p>
                <p>• everyone can like, comment, and share the winner</p>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="w-5 h-5" />
                  community rules
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-black space-y-2">
                <p>• celebrate the ordinary and mundane</p>
                <p>• no judgment, only support</p>
                <p>• keep it boring and wholesome</p>
                <p>• share your everyday moments</p>
              </CardContent>
            </Card>
            
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <FileText className="w-5 h-5" />
                  your stats
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-black space-y-2">
                <p>tokens remaining: <span className="font-bold">{currentUser.tokens_remaining}</span></p>
                <p>member since: {new Date(currentUser.created_at).toLocaleDateString()}</p>
                <p>boring level: <span className="font-bold">maximum</span></p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submission Dialog */}
        <Dialog open={showSubmission} onOpenChange={setShowSubmission}>
          <DialogContent className="max-w-md border-black">
            <DialogHeader>
              <DialogTitle className="text-black">submit your boring moment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmission} className="space-y-4">
              <div>
                <Label htmlFor="text-content" className="text-black">your boring story (max 1000 characters)</Label>
                <Textarea
                  id="text-content"
                  value={subForm.text_content}
                  onChange={(e) => setSubForm({...subForm, text_content: e.target.value})}
                  placeholder="i organized my pencils by color today..."
                  className="min-h-[100px] border-black focus:border-black focus:ring-black"
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-black mt-1">
                  {subForm.text_content.length}/1000 characters
                </div>
              </div>
              
              <div>
                <Label htmlFor="instagram" className="text-black">instagram link (optional)</Label>
                <Input
                  id="instagram"
                  value={subForm.instagram_link}
                  onChange={(e) => setSubForm({...subForm, instagram_link: e.target.value})}
                  placeholder="https://instagram.com/..."
                  className="border-black focus:border-black focus:ring-black"
                />
              </div>
              
              <div>
                <Label htmlFor="tiktok" className="text-black">tiktok link (optional)</Label>
                <Input
                  id="tiktok"
                  value={subForm.tiktok_link}
                  onChange={(e) => setSubForm({...subForm, tiktok_link: e.target.value})}
                  placeholder="https://tiktok.com/..."
                  className="border-black focus:border-black focus:ring-black"
                />
              </div>
              
              <div className="bg-white border border-black p-3 rounded-lg text-sm text-black">
                this will use 1 token. you have {currentUser.tokens_remaining} tokens remaining.
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white" 
                disabled={currentUser.tokens_remaining <= 0}
              >
                submit for daily lottery
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
                          <div className="font-medium text-black">{submission.user_nickname}</div>
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