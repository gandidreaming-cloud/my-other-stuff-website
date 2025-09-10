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
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@boring.com",
            "boring_answer": "I spent 3 hours organizing my sock drawer by color and fabric type."
        }
        
        success, response = self.run_test("User Registration", "POST", "users", 200, test_data)
        if success and response:
            try:
                user_data = response.json()
                self.test_user_id = user_data.get("id")
                print(f"   📝 Created user ID: {self.test_user_id}")
                print(f"   📝 Tokens: {user_data.get('tokens_remaining', 'N/A')}")
                return True
            except:
                pass
        return success

    def test_duplicate_registration(self):
        """Test duplicate email registration (should fail)"""
        if not self.test_user_id:
            return self.log_test("Duplicate Registration", False, "No test user created")
        
        # Try to register with same email
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "name": f"Duplicate User {timestamp}",
            "email": f"test{timestamp}@boring.com",  # Same email as before
            "boring_answer": "Another boring answer"
        }
        
        success, response = self.run_test("Duplicate Registration (Should Fail)", "POST", "users", 400, test_data)
        return success

    def test_user_login(self):
        """Test user login by email"""
        if not self.test_user_id:
            return self.log_test("User Login", False, "No test user created")
        
        timestamp = datetime.now().strftime("%H%M%S")
        email = f"test{timestamp}@boring.com"
        
        success, response = self.run_test("User Login", "GET", f"users/email/{email}", 200)
        if success and response:
            try:
                user_data = response.json()
                retrieved_id = user_data.get("id")
                if retrieved_id == self.test_user_id:
                    print(f"   📝 Login successful for user: {user_data.get('name')}")
                    return True
                else:
                    return self.log_test("User Login", False, "User ID mismatch")
            except:
                pass
        return success

    def test_user_not_found(self):
        """Test login with non-existent email"""
        success, response = self.run_test("User Not Found", "GET", "users/email/nonexistent@boring.com", 404)
        return success

    def test_content_submission(self):
        """Test content submission"""
        if not self.test_user_id:
            return self.log_test("Content Submission", False, "No test user created")
        
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
            params={"user_id": self.test_user_id}
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
        """Test submission when user has no tokens (should fail after 3 submissions)"""
        if not self.test_user_id:
            return self.log_test("No Tokens Submission", False, "No test user created")
        
        # Make 2 more submissions to exhaust tokens (user starts with 3)
        for i in range(2):
            submission_data = {
                "text_content": f"Boring submission #{i+2}: I counted {i*100} grains of rice today."
            }
            
            success, response = self.run_test(
                f"Submission #{i+2}", 
                "POST", 
                "submissions", 
                200, 
                submission_data,
                params={"user_id": self.test_user_id}
            )
            
            if not success:
                return False
        
        # Now try 4th submission (should fail)
        submission_data = {
            "text_content": "This should fail - no tokens left"
        }
        
        success, response = self.run_test(
            "No Tokens Submission (Should Fail)", 
            "POST", 
            "submissions", 
            400, 
            submission_data,
            params={"user_id": self.test_user_id}
        )
        return success

    def test_make_admin(self):
        """Test making user admin"""
        if not self.test_user_id:
            return self.log_test("Make Admin", False, "No test user created")
        
        success, response = self.run_test(
            "Make Admin", 
            "POST", 
            "admin/make-admin", 
            200,
            params={"user_id": self.test_user_id}
        )
        
        if success:
            self.admin_user_id = self.test_user_id
            print(f"   📝 User {self.test_user_id} is now admin")
        
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
        if not self.test_user_id or not self.test_submission_id:
            return self.log_test("Like Interaction", False, "No user or submission")
        
        like_data = {"type": "like"}
        
        success, response = self.run_test(
            "Like Interaction", 
            "POST", 
            f"submissions/{self.test_submission_id}/interactions", 
            200,
            like_data,
            params={"user_id": self.test_user_id}
        )
        return success

    def test_comment_interaction(self):
        """Test commenting on a submission"""
        if not self.test_user_id or not self.test_submission_id:
            return self.log_test("Comment Interaction", False, "No user or submission")
        
        comment_data = {
            "type": "comment",
            "content": "This is so wonderfully boring! I love it!"
        }
        
        success, response = self.run_test(
            "Comment Interaction", 
            "POST", 
            f"submissions/{self.test_submission_id}/interactions", 
            200,
            comment_data,
            params={"user_id": self.test_user_id}
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
                    print(f"   📝 {interaction.get('type')}: {interaction.get('content', 'N/A')[:30]}...")
                return True
            except:
                pass
        return success

    def test_admin_stats(self):
        """Test getting admin statistics"""
        if not self.admin_user_id:
            return self.log_test("Admin Stats", False, "No admin user")
        
        success, response = self.run_test(
            "Admin Stats", 
            "GET", 
            "admin/stats", 
            200,
            params={"admin_user_id": self.admin_user_id}
        )
        
        if success and response:
            try:
                stats = response.json()
                print(f"   📝 Total Users: {stats.get('total_users')}")
                print(f"   📝 Total Submissions: {stats.get('total_submissions')}")
                print(f"   📝 Pending: {stats.get('pending_submissions')}")
                print(f"   📝 Approved: {stats.get('approved_submissions')}")
                return True
            except:
                pass
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Boring App API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # User management
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