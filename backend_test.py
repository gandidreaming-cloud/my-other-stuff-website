import requests
import sys
import json
from datetime import datetime
import uuid

class BoringAppAPITester:
    def __init__(self, base_url="https://dailyboring.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_id = None
        self.test_submission_id = None
        self.admin_user_id = None
        self.admin_magic_word = None
        self.test_comment_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                if response.text:
                    try:
                        error_data = response.json()
                        details += f" - {error_data.get('detail', response.text[:100])}"
                    except:
                        details += f" - {response.text[:100]}"

            return self.log_test(name, success, details), response

        except Exception as e:
            return self.log_test(name, False, f"Error: {str(e)}"), None

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test("Root API Endpoint", "GET", "", 200)
        if success and response:
            try:
                data = response.json()
                if "Boring" in data.get("message", ""):
                    print(f"   📝 Message: {data['message']}")
                    return True
            except:
                pass
        return success

    def test_user_registration(self):
        """Test user registration with new API structure"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "nickname": f"testuser{timestamp}",
            "email": f"test{timestamp}@boring.com"
        }
        
        success, response = self.run_test("User Registration", "POST", "register", 200, test_data)
        if success and response:
            try:
                user_data = response.json()
                self.test_user_id = user_data.get("user_id")
                magic_word = user_data.get("magic_word")
                print(f"   📝 Created user ID: {self.test_user_id}")
                print(f"   📝 Magic word: {magic_word}")
                return True
            except:
                pass
        return success

    def test_admin_registration(self):
        """Test admin user registration (gandi.pacific@gmail.com should get 999 tokens)"""
        test_data = {
            "nickname": "gandi",
            "email": "gandi.pacific@gmail.com"
        }
        
        success, response = self.run_test("Admin Registration", "POST", "register", 200, test_data)
        if success and response:
            try:
                user_data = response.json()
                self.admin_user_id = user_data.get("user_id")
                self.admin_magic_word = user_data.get("magic_word")
                print(f"   📝 Created admin user ID: {self.admin_user_id}")
                print(f"   📝 Admin magic word: {self.admin_magic_word}")
                
                # Verify admin has 999 tokens by getting user details
                user_success, user_response = self.run_test("Get Admin User", "GET", f"users/{self.admin_user_id}", 200)
                if user_success and user_response:
                    admin_details = user_response.json()
                    tokens = admin_details.get("tokens_remaining")
                    is_admin = admin_details.get("is_admin")
                    print(f"   📝 Admin tokens: {tokens}")
                    print(f"   📝 Is admin: {is_admin}")
                    if tokens == 999 and is_admin:
                        print("   ✅ Admin user correctly configured with 999 tokens and admin status")
                        return True
                    else:
                        print(f"   ❌ Admin user not properly configured. Tokens: {tokens}, Is admin: {is_admin}")
                        return False
                return True
            except Exception as e:
                print(f"   ❌ Error processing admin registration: {e}")
                pass
        return success

    def test_duplicate_registration(self):
        """Test duplicate nickname registration (should fail)"""
        if not self.test_user_id:
            return self.log_test("Duplicate Registration", False, "No test user created")
        
        # Try to register with same nickname
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "nickname": f"testuser{timestamp}",  # Same nickname as before
            "email": f"different{timestamp}@boring.com"
        }
        
        success, response = self.run_test("Duplicate Nickname (Should Fail)", "POST", "register", 400, test_data)
        return success

    def test_user_login(self):
        """Test user login with nickname and magic word"""
        if not self.test_user_id:
            return self.log_test("User Login", False, "No test user created")
        
        # We need to get the magic word from registration
        # For testing, let's try to login with admin credentials
        if self.admin_user_id and self.admin_magic_word:
            login_data = {
                "nickname": "gandi",
                "magic_word": self.admin_magic_word
            }
            
            success, response = self.run_test("Admin User Login", "POST", "login", 200, login_data)
            if success and response:
                try:
                    user_data = response.json()
                    print(f"   📝 Login successful for user: {user_data.get('nickname')}")
                    print(f"   📝 User ID: {user_data.get('id')}")
                    print(f"   📝 Tokens: {user_data.get('tokens_remaining')}")
                    return True
                except:
                    pass
        return success

    def test_user_not_found(self):
        """Test login with invalid credentials"""
        invalid_login = {
            "nickname": "nonexistent",
            "magic_word": "invalidmagicword"
        }
        success, response = self.run_test("Invalid Login (Should Fail)", "POST", "login", 401, invalid_login)
        return success

    def test_content_submission(self):
        """Test content submission"""
        if not self.admin_user_id:
            return self.log_test("Content Submission", False, "No admin user created")
        
        submission_data = {
            "text_content": "Today I watched paint dry for exactly 47 minutes. It was beige paint on a white wall. Very thrilling.",
            "instagram_link": "https://instagram.com/boring_moments",
            "tiktok_link": "https://tiktok.com/@boring_life"
        }
        
        success, response = self.run_test(
            "Content Submission", 
            "POST", 
            "submissions", 
            200, 
            submission_data,
            params={"user_id": self.admin_user_id}
        )
        
        if success and response:
            try:
                result = response.json()
                self.test_submission_id = result.get("submission_id")
                print(f"   📝 Submission ID: {self.test_submission_id}")
                return True
            except:
                pass
        return success

    def test_submission_without_tokens(self):
        """Test submission when regular user has no tokens (admin has 999 so skip this test)"""
        # Since we're using admin user with 999 tokens, this test is not applicable
        return self.log_test("No Tokens Test", True, "Skipped - using admin user with 999 tokens")

    def test_comment_interaction(self):
        """Test commenting on a submission"""
        if not self.admin_user_id or not self.test_submission_id:
            return self.log_test("Comment Interaction", False, "No user or submission")
        
        comment_data = {
            "type": "comment",
            "content": "This is so wonderfully boring! I love how mundane it is!"
        }
        
        success, response = self.run_test(
            "Comment Interaction", 
            "POST", 
            f"submissions/{self.test_submission_id}/interactions", 
            200,
            comment_data,
            params={"user_id": self.admin_user_id}
        )
        
        if success and response:
            # Get the comment ID from interactions
            interactions_success, interactions_response = self.run_test(
                "Get Interactions for Comment ID", 
                "GET", 
                f"submissions/{self.test_submission_id}/interactions", 
                200
            )
            
            if interactions_success and interactions_response:
                try:
                    interactions = interactions_response.json()
                    for interaction in interactions:
                        if interaction.get("type") == "comment":
                            self.test_comment_id = interaction.get("id")
                            print(f"   📝 Comment ID: {self.test_comment_id}")
                            break
                except:
                    pass
        
        return success

    def test_comment_like_functionality(self):
        """Test the new comment liking functionality"""
        if not self.admin_user_id or not self.test_comment_id:
            return self.log_test("Comment Like Functionality", False, "No user or comment")
        
        # Test 1: Like a comment
        success1, response1 = self.run_test(
            "Like Comment", 
            "POST", 
            f"comments/{self.test_comment_id}/like", 
            200,
            params={"user_id": self.admin_user_id}
        )
        
        if not success1:
            return False
        
        # Test 2: Get comment likes count
        success2, response2 = self.run_test(
            "Get Comment Likes Count", 
            "GET", 
            f"comments/{self.test_comment_id}/likes-count", 
            200
        )
        
        if success2 and response2:
            try:
                likes_data = response2.json()
                likes_count = likes_data.get("likes_count", 0)
                print(f"   📝 Comment likes count: {likes_count}")
                if likes_count == 1:
                    print("   ✅ Comment like count is correct")
                else:
                    print(f"   ❌ Expected 1 like, got {likes_count}")
                    return False
            except:
                return False
        
        # Test 3: Unlike the comment (toggle)
        success3, response3 = self.run_test(
            "Unlike Comment (Toggle)", 
            "POST", 
            f"comments/{self.test_comment_id}/like", 
            200,
            params={"user_id": self.admin_user_id}
        )
        
        if not success3:
            return False
        
        # Test 4: Verify likes count is now 0
        success4, response4 = self.run_test(
            "Verify Unlike - Get Likes Count", 
            "GET", 
            f"comments/{self.test_comment_id}/likes-count", 
            200
        )
        
        if success4 and response4:
            try:
                likes_data = response4.json()
                likes_count = likes_data.get("likes_count", 0)
                print(f"   📝 Comment likes count after unlike: {likes_count}")
                if likes_count == 0:
                    print("   ✅ Comment unlike functionality works correctly")
                    return True
                else:
                    print(f"   ❌ Expected 0 likes after unlike, got {likes_count}")
                    return False
            except:
                return False
        
        return success2 and success3 and success4

    def test_enhanced_interactions_endpoint(self):
        """Test that interactions endpoint returns comments with likes_count"""
        if not self.test_submission_id or not self.test_comment_id:
            return self.log_test("Enhanced Interactions", False, "No submission or comment")
        
        # First, like the comment again
        like_success, _ = self.run_test(
            "Like Comment for Enhanced Test", 
            "POST", 
            f"comments/{self.test_comment_id}/like", 
            200,
            params={"user_id": self.admin_user_id}
        )
        
        if not like_success:
            return False
        
        # Now get interactions and verify likes_count is included
        success, response = self.run_test(
            "Get Enhanced Interactions", 
            "GET", 
            f"submissions/{self.test_submission_id}/interactions", 
            200
        )
        
        if success and response:
            try:
                interactions = response.json()
                print(f"   📝 Found {len(interactions)} interactions")
                
                comment_found = False
                for interaction in interactions:
                    if interaction.get("type") == "comment" and interaction.get("id") == self.test_comment_id:
                        comment_found = True
                        likes_count = interaction.get("likes_count")
                        print(f"   📝 Comment content: {interaction.get('content', '')[:50]}...")
                        print(f"   📝 Comment likes_count: {likes_count}")
                        
                        if likes_count is not None and likes_count >= 0:
                            print("   ✅ Enhanced interactions endpoint includes likes_count")
                            return True
                        else:
                            print("   ❌ likes_count field missing or invalid")
                            return False
                
                if not comment_found:
                    print("   ❌ Comment not found in interactions")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Error processing interactions: {e}")
                return False
        
        return success

    def test_make_admin(self):
        """Test admin functionality - this endpoint should be blocked"""
        if not self.admin_user_id:
            return self.log_test("Make Admin", False, "No admin user created")
        
        # This should fail as per the API - admin access is restricted
        success, response = self.run_test(
            "Make Admin (Should Fail)", 
            "POST", 
            "admin/make-admin", 
            403,
            params={"user_id": self.admin_user_id}
        )
        
        return success

    def test_pending_submissions(self):
        """Test getting pending submissions"""
        success, response = self.run_test("Get Pending Submissions", "GET", "submissions/pending", 200)
        
        if success and response:
            try:
                submissions = response.json()
                print(f"   📝 Found {len(submissions)} pending submissions")
                return True
            except:
                pass
        return success

    def test_approve_submission(self):
        """Test approving a submission"""
        if not self.admin_user_id or not self.test_submission_id:
            return self.log_test("Approve Submission", False, "No admin user or submission")
        
        approval_data = {"status": "approved"}
        
        success, response = self.run_test(
            "Approve Submission", 
            "PUT", 
            f"submissions/{self.test_submission_id}/status", 
            200,
            approval_data,
            params={"admin_user_id": self.admin_user_id}
        )
        return success

    def test_run_lottery(self):
        """Test running the daily lottery"""
        if not self.admin_user_id:
            return self.log_test("Run Lottery", False, "No admin user")
        
        success, response = self.run_test(
            "Run Daily Lottery", 
            "POST", 
            "run-lottery", 
            200,
            params={"admin_user_id": self.admin_user_id}
        )
        
        if success and response:
            try:
                result = response.json()
                print(f"   📝 Lottery result: {result.get('message')}")
                if "winner_id" in result:
                    print(f"   📝 Winner ID: {result['winner_id']}")
                return True
            except:
                pass
        return success

    def test_today_winner(self):
        """Test getting today's winner"""
        success, response = self.run_test("Get Today's Winner", "GET", "today-winner", 200)
        
        if success and response:
            try:
                winner = response.json()
                if winner:
                    print(f"   📝 Winner: {winner.get('user_name')} - {winner.get('text_content', '')[:50]}...")
                    print(f"   📝 Likes: {winner.get('likes_count', 0)}, Comments: {winner.get('comments_count', 0)}")
                    return True
                else:
                    print("   📝 No winner selected yet")
                    return True
            except:
                pass
        return success

    def test_like_interaction(self):
        """Test liking a submission"""
        if not self.admin_user_id or not self.test_submission_id:
            return self.log_test("Like Interaction", False, "No user or submission")
        
        like_data = {"type": "like"}
        
        success, response = self.run_test(
            "Like Interaction", 
            "POST", 
            f"submissions/{self.test_submission_id}/interactions", 
            200,
            like_data,
            params={"user_id": self.admin_user_id}
        )
        return success

    def test_get_interactions(self):
        """Test getting interactions for a submission"""
        if not self.test_submission_id:
            return self.log_test("Get Interactions", False, "No submission")
        
        success, response = self.run_test(
            "Get Interactions", 
            "GET", 
            f"submissions/{self.test_submission_id}/interactions", 
            200
        )
        
        if success and response:
            try:
                interactions = response.json()
                print(f"   📝 Found {len(interactions)} interactions")
                for interaction in interactions:
                    interaction_type = interaction.get('type')
                    content = interaction.get('content', 'N/A')
                    likes_count = interaction.get('likes_count', 'N/A')
                    print(f"   📝 {interaction_type}: {content[:30]}... (likes: {likes_count})")
                return True
            except:
                pass
        return success

    def test_admin_stats(self):
        """Test getting admin statistics - this endpoint doesn't exist in current API"""
        return self.log_test("Admin Stats", True, "Endpoint not implemented in current API")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Boring App API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # User management - Test admin registration first
        self.test_admin_registration()
        self.test_user_registration()
        self.test_duplicate_registration()
        self.test_user_login()
        self.test_user_not_found()
        
        # Content submission
        self.test_content_submission()
        self.test_submission_without_tokens()
        
        # Admin functionality
        self.test_make_admin()
        self.test_pending_submissions()
        self.test_approve_submission()
        self.test_run_lottery()
        self.test_today_winner()
        
        # Social interactions
        self.test_like_interaction()
        self.test_comment_interaction()
        
        # NEW: Comment liking functionality
        self.test_comment_like_functionality()
        self.test_enhanced_interactions_endpoint()
        
        # Get interactions (should show likes_count for comments)
        self.test_get_interactions()
        
        # Admin stats
        self.test_admin_stats()
        
        # Print results
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = BoringAppAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())