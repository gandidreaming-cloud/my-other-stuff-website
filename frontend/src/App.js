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
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentLikes, setCommentLikes] = useState(new Map());
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [randomSubmission, setRandomSubmission] = useState(null);
  const [showLotteryPreview, setShowLotteryPreview] = useState(false);
  const [lotteryLoading, setLotteryLoading] = useState(false);
  
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
  
  // Info modals state
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCommunityRules, setShowCommunityRules] = useState(false);
  const [showYourStats, setShowYourStats] = useState(false);

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
      console.log("Fetched interactions:", response.data); // Debug log
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
      setShowCommentForm(false);
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
      setLotteryLoading(true);
      setShowLotteryPreview(true);
      
      // Add some suspense with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await axios.get(`${API}/random-submission?admin_user_id=${currentUser.id}`);
      setRandomSubmission(response.data);
      setLotteryLoading(false);
    } catch (error) {
      setLotteryLoading(false);
      setShowLotteryPreview(false);
      toast.error(error.response?.data?.detail || "Failed to get random submission");
    }
  };

  const confirmWinner = async () => {
    if (!randomSubmission) return;
    
    try {
      await axios.post(`${API}/set-winner/${randomSubmission.id}?admin_user_id=${currentUser.id}`);
      setShowLotteryPreview(false);
      setRandomSubmission(null);
      await fetchTodayWinner();
      toast.success("Winner set successfully!");
    } catch (error) {
      toast.error("Failed to set winner");
    }
  };

  const rejectWinner = async () => {
    // Get another random submission with loading effect
    setLotteryLoading(true);
    setRandomSubmission(null);
    
    // Add suspense
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const response = await axios.get(`${API}/random-submission?admin_user_id=${currentUser.id}`);
      setRandomSubmission(response.data);
      setLotteryLoading(false);
    } catch (error) {
      setLotteryLoading(false);
      toast.error(error.response?.data?.detail || "Failed to get random submission");
    }
  };

  const clearWinner = async () => {
    try {
      const response = await axios.post(`${API}/clear-winner?admin_user_id=${currentUser.id}`);
      await fetchTodayWinner();
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to clear winner");
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

  const handleCommentLike = async (commentId) => {
    if (!currentUser) {
      toast.error("Please login to like comments");
      return;
    }

    try {
      const response = await axios.post(`${API}/comments/${commentId}/like?user_id=${currentUser.id}`);
      
      // Refresh interactions to get updated like counts
      await fetchInteractions(todayWinner.id);
      
      // Update user tokens if someone got rewarded
      const updatedUser = await axios.get(`${API}/users/${currentUser.id}`);
      if (updatedUser.data) {
        const sessionData = {
          ...currentUser,
          tokens_remaining: updatedUser.data.tokens_remaining
        };
        localStorage.setItem('boringUser', JSON.stringify(sessionData));
        setCurrentUser(sessionData);
      }
      
      toast.success(response.data.message || "Comment like updated!");
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("Link copied to clipboard!");
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
          
          <div className="w-full flex justify-center">
            <div className="w-72">
              <form onSubmit={handleRegistration} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="nickname" className="text-black font-medium text-center block">nickname</Label>
                  <Input
                    id="nickname"
                    value={regForm.nickname}
                    onChange={(e) => setRegForm({...regForm, nickname: e.target.value})}
                    className="w-full bg-transparent border border-black focus:border-black focus:ring-0 rounded px-2 py-1"
                    style={{ borderWidth: '0.5px' }}
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-black font-medium text-center block">email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                    className="w-full bg-transparent border border-black focus:border-black focus:ring-0 rounded px-2 py-1"
                    style={{ borderWidth: '0.5px' }}
                    required
                  />
                </div>
                
                <div className="pt-1">
                  <Button 
                    type="submit"
                    className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    registration
                  </Button>
                </div>
              </form>
            </div>
          </div>
            
          <div className="text-center mt-8">
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
          
          <div className="w-full flex justify-center">
            <div className="w-72">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="login-nickname" className="text-black font-medium text-center block">nickname</Label>
                  <Input
                    id="login-nickname"
                    value={loginForm.nickname}
                    onChange={(e) => setLoginForm({...loginForm, nickname: e.target.value})}
                    className="w-full bg-transparent border border-black focus:border-black focus:ring-0 rounded px-2 py-1"
                    style={{ borderWidth: '0.5px' }}
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="magic-word" className="text-black font-medium text-center block">magic word</Label>
                  <Input
                    id="magic-word"
                    value={loginForm.magic_word}
                    onChange={(e) => setLoginForm({...loginForm, magic_word: e.target.value})}
                    className="w-full bg-transparent border border-black focus:border-black focus:ring-0 rounded px-2 py-1 font-mono"
                    style={{ borderWidth: '0.5px' }}
                    placeholder="rrriiinnngggooobbbo"
                    required
                  />
                </div>
                
                <div className="pt-1">
                  <Button 
                    type="submit"
                    className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    login
                  </Button>
                </div>
              </form>
            </div>
          </div>
            
          <div className="text-center mt-8">
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
    );
  }

  // Main App (logged in users)
  if (currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster />
        
        {/* Header */}
        <header className="bg-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Three Column Layout */}
            <div className="grid grid-cols-3 items-start">
              {/* Left: User Info with hover logout */}
              <div className="text-left">
                <div className="group cursor-pointer">
                  <div className="text-xl font-medium text-black">
                    {currentUser.nickname}
                    <Button 
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-black hover:bg-black hover:text-white text-xs ml-1 px-1 py-0 inline-block"
                    >
                      (logout)
                    </Button>
                  </div>
                  <div className="text-sm text-black">tokens: {currentUser.tokens_remaining}</div>
                </div>
              </div>
              
              {/* Center: Site Title */}
              <div className="text-center">
                <h1 className="text-4xl font-light text-black mb-1">boooring</h1>
                <p className="text-xs text-black">ordinary is extraordinary</p>
              </div>
              
              {/* Right: Submit button and Admin */}
              <div className="text-right space-y-2">
                <div>
                  <Button 
                    onClick={() => setShowSubmission(true)}
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-black hover:text-white text-xs leading-tight bg-transparent hover:px-1 transition-all duration-200"
                    style={{
                      padding: '0',
                      lineHeight: '1.2',
                      background: 'transparent',
                    }}
                  >
                    <span className="hover:bg-black hover:text-white hover:px-1 transition-all duration-200">
                      tell your<br/>boring story<br/>for tomorrow
                    </span>
                  </Button>
                </div>
                {currentUser.is_admin && (
                  <div>
                    <Button 
                      onClick={() => setShowAdmin(true)} 
                      variant="ghost"
                      size="sm"
                      className="text-black hover:bg-black hover:text-white text-xs px-2 py-1"
                    >
                      admin
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6">
          {/* Today's Winner */}
          {todayWinner ? (
            <div className="mb-8">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-light text-black">today's boring winner</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg font-medium text-black">{todayWinner.user_nickname}</span>
                  {(todayWinner.instagram_link || todayWinner.tiktok_link) && (
                    <>
                      <span className="text-black">|</span>
                      <div className="flex items-center gap-1">
                        {todayWinner.instagram_link && (
                          <a 
                            href={todayWinner.instagram_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-black hover:opacity-70"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                            </svg>
                          </a>
                        )}
                        {todayWinner.tiktok_link && (
                          <a 
                            href={todayWinner.tiktok_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-black hover:opacity-70"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z" fill="currentColor"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-sm text-black mt-1">
                  {new Date(todayWinner.created_at).toLocaleDateString('en-GB').replace(/\//g, '.')}
                </div>
              </div>
              
              <div className="bg-white border border-black rounded-lg p-3 text-center mb-3 max-w-lg mx-auto">
                <div className="text-sm text-black mb-2 font-medium">their story:</div>
                <p className="text-base leading-relaxed text-black">
                  {todayWinner.text_content}
                </p>
              </div>
              {/* Interaction Buttons */}
              <div className="flex justify-center gap-0 items-center mb-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  className={`flex items-center gap-1 hover:bg-black hover:text-white px-1 py-1 ${userLikes.has(todayWinner.id) ? 'text-black' : 'text-black'}`}
                >
                  <Heart className={`w-4 h-4 ${userLikes.has(todayWinner.id) ? 'fill-current' : ''}`} />
                  {todayWinner.likes_count}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 text-black hover:bg-black hover:text-white px-1 py-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  {todayWinner.comments_count}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-black hover:bg-black hover:text-white px-1 py-1"
                  onClick={handleShare}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                  </svg>
                </Button>
              </div>

              {/* Leave a comment button */}
              <div className="text-center mb-4">
                {!showComments ? (
                  <Button
                    onClick={() => {
                      setShowComments(true);
                      // Load comments if needed
                      if (todayWinner && interactions.length === 0) {
                        fetchInteractions(todayWinner.id);
                      }
                      // Scroll to comments section
                      setTimeout(() => {
                        const commentsSection = document.querySelector('.comments-section');
                        if (commentsSection) {
                          commentsSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }
                      }, 100);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-black hover:text-white px-2 py-1"
                  >
                    leave a comment
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowCommentForm(true)}
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-black hover:text-white px-2 py-1"
                  >
                    leave a comment
                  </Button>
                )}
              </div>
              
              {/* Comments Section */}
              <div className="space-y-4">
                {showCommentForm && (
                  <form onSubmit={handleComment} className="flex gap-2 justify-center">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="your boring comment"
                      className="max-w-md border-black focus:border-black focus:ring-black resize-none min-h-[40px]"
                      maxLength={300}
                      rows={1}
                      style={{ height: 'auto' }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <Button 
                        type="submit" 
                        size="sm"
                        className="bg-white text-black border-2 border-black hover:bg-black hover:text-white h-10"
                      >
                        comment
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowCommentForm(false);
                          setCommentText('');
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-black hover:bg-black hover:text-white text-xs h-6"
                      >
                        cancel
                      </Button>
                    </div>
                  </form>
                )}
                
                {/* Comments Section - only show when clicked */}
                {showComments && (
                  <div className="comments-section mt-6">
                    <div className="text-center mb-3">
                      <h3 className="text-sm font-medium text-black">comments</h3>
                    </div>
                    
                    <div className="space-y-2 max-w-2xl mx-auto">
                      {(() => {
                        const comments = interactions.filter(int => int.type === "comment");
                        console.log("Filtered comments:", comments); // Debug log
                        console.log("Total interactions:", interactions); // Debug log
                        
                        if (comments.length === 0) {
                          return (
                            <div className="text-center text-sm text-black opacity-60 py-4">
                              no comments yet. be the first to comment!
                            </div>
                          );
                        }
                        
                        // Sort comments by likes count (descending), then by creation date (ascending)
                        const sortedComments = comments.sort((a, b) => {
                          const likesA = a.likes_count || 0;
                          const likesB = b.likes_count || 0;
                          if (likesA !== likesB) {
                            return likesB - likesA; // Most liked first
                          }
                          return new Date(a.created_at) - new Date(b.created_at); // Oldest first if same likes
                        });
                        
                        const commentsToShow = showAllComments ? sortedComments : sortedComments.slice(0, 3);
                        
                        return (
                          <>
                            {commentsToShow.map(comment => (
                              <div key={comment.id} className="bg-white border border-black rounded p-3 flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-black">{comment.user_nickname}</div>
                                  <div className="text-black mb-2">{comment.content}</div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleCommentLike(comment.id)}
                                      className="flex items-center gap-1 text-xs text-black hover:bg-black hover:text-white px-2 py-1 rounded"
                                    >
                                      <Heart className={`w-3 h-3 ${comment.likes_count > 0 ? 'fill-current' : ''}`} />
                                      {comment.likes_count || 0}
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs text-black ml-4">
                                  {new Date(comment.created_at).toLocaleDateString('en-GB').replace(/\//g, '.')}
                                </div>
                              </div>
                            ))}
                            
                            {!showAllComments && sortedComments.length > 3 && (
                              <div className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAllComments(true)}
                                  className="text-black hover:bg-black hover:text-white"
                                >
                                  еще комментарии ({sortedComments.length - 3})
                                </Button>
                              </div>
                            )}
                            
                            {showAllComments && sortedComments.length > 3 && (
                              <div className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAllComments(false)}
                                  className="text-black hover:bg-black hover:text-white"
                                >
                                  скрыть комментарии
                                </Button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="mb-8 text-center py-12 border-black relative">
              <CardContent>
                <Clock className="w-12 h-12 text-black mx-auto mb-4" />
                <h2 className="text-2xl font-light text-black mb-4">no winner yet today</h2>
                
                {/* Submit Button - closer to title */}
                <Button 
                  onClick={() => setShowSubmission(true)} 
                  disabled={currentUser.tokens_remaining <= 0}
                  className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  submit boring content
                </Button>
                
                {/* Lottery info at bottom */}
                <div className="absolute bottom-4 left-0 right-0">
                  <p className="text-black text-xs opacity-60">the daily lottery at GMT+2</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-12 pb-8">
            <Button
              variant="ghost"
              onClick={() => setShowHowItWorks(true)}
              className="text-black hover:bg-black hover:text-white"
            >
              how it works
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCommunityRules(true)}
              className="text-black hover:bg-black hover:text-white"
            >
              community rules
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowYourStats(true)}
              className="text-black hover:bg-black hover:text-white"
            >
              your stats
            </Button>
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
                      <h3 className="font-medium mb-2 text-black">daily lottery</h3>
                      <p className="text-sm text-black mb-4">
                        randomly preview submissions for winner selection
                      </p>
                      <Button 
                        onClick={runLottery}
                        className="bg-white text-black border-2 border-black hover:bg-black hover:text-white mr-2"
                      >
                        run lottery now
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-black">
                    <CardContent className="pt-4">
                      <h3 className="font-medium mb-2 text-black">winner management</h3>
                      <p className="text-sm text-black mb-4">
                        clear current winner to prepare for next lottery
                      </p>
                      <Button 
                        onClick={clearWinner}
                        variant="outline"
                        className="border-black text-black hover:bg-black hover:text-white"
                      >
                        clear current winner
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Lottery Preview Modal */}
        <Dialog open={showLotteryPreview} onOpenChange={setShowLotteryPreview}>
          <DialogContent className="max-w-2xl border-black">
            <DialogHeader>
              <DialogTitle className="text-black">lottery preview</DialogTitle>
            </DialogHeader>
            
            {lotteryLoading ? (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-lg text-black mb-4">selecting random boring story...</div>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            ) : randomSubmission ? (
              <div className="space-y-4">
                <div className="text-center text-sm text-black opacity-70 mb-2">
                  randomly selected:
                </div>
                <div className="bg-white border border-black rounded-lg p-4 animate-pulse-once">
                  <div className="text-sm text-black font-medium mb-2">
                    by {randomSubmission.user_nickname}
                  </div>
                  <p className="text-black mb-4">
                    {randomSubmission.text_content}
                  </p>
                  {(randomSubmission.instagram_link || randomSubmission.tiktok_link) && (
                    <div className="text-sm text-black">
                      links:{' '}
                      {randomSubmission.instagram_link && (
                        <a href={randomSubmission.instagram_link} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                          instagram
                        </a>
                      )}
                      {randomSubmission.instagram_link && randomSubmission.tiktok_link && ' / '}
                      {randomSubmission.tiktok_link && (
                        <a href={randomSubmission.tiktok_link} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                          tiktok
                        </a>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-center space-x-4">
                  <Button 
                    onClick={confirmWinner}
                    className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    set as winner
                  </Button>
                  <Button 
                    onClick={rejectWinner}
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white"
                    disabled={lotteryLoading}
                  >
                    try another one
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowLotteryPreview(false);
                      setRandomSubmission(null);
                      setLotteryLoading(false);
                    }}
                    variant="ghost"
                    className="text-black hover:bg-black hover:text-white"
                  >
                    cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Info Modals */}
        
        {/* How It Works Modal */}
        <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <DialogContent className="max-w-md border-black">
            <DialogHeader>
              <DialogTitle className="text-black flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                how it works
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-black space-y-2">
              <p>• submit your most boring moment using a token</p>
              <p>• admin reviews and approves submissions</p>
              <p>• one random winner chosen daily at GMT+2</p>
              <p>• when someone likes your comment, you earn 1 token per 10 likes</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Community Rules Modal */}
        <Dialog open={showCommunityRules} onOpenChange={setShowCommunityRules}>
          <DialogContent className="max-w-md border-black">
            <DialogHeader>
              <DialogTitle className="text-black flex items-center gap-2">
                <Users className="w-5 h-5" />
                community rules
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-black space-y-2">
              <p>• celebrate the ordinary and mundane</p>
              <p>• no judgment, only support</p>
              <p>• keep it boring and wholesome</p>
              <p>• share your everyday moments</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Your Stats Modal */}
        <Dialog open={showYourStats} onOpenChange={setShowYourStats}>
          <DialogContent className="max-w-md border-black">
            <DialogHeader>
              <DialogTitle className="text-black flex items-center gap-2">
                <FileText className="w-5 h-5" />
                your stats
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-black space-y-2">
              <p>tokens remaining: <span className="font-bold">{currentUser.tokens_remaining}</span></p>
              <p>member since: {new Date(currentUser.created_at).toLocaleDateString()}</p>
              <p>boring level: <span className="font-bold">maximum</span></p>
            </div>
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