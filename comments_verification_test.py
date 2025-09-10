#!/usr/bin/env python3
"""
Focused test to verify comments exist in database and interactions API is working
Based on the review request to check:
1. Current winner
2. Number of interactions for winner
3. Specifically count comments
4. Test GET /api/submissions/{submission_id}/interactions endpoint
"""

import requests
import json
from datetime import datetime

class CommentsVerificationTester:
    def __init__(self, base_url="https://dailyboring.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        
    def log_info(self, message):
        """Log information with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def log_error(self, message):
        """Log error with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] ❌ ERROR: {message}")
        
    def log_success(self, message):
        """Log success with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] ✅ SUCCESS: {message}")

    def get_current_winner(self):
        """Step 1: Get current winner from GET /api/today-winner"""
        self.log_info("Step 1: Checking for current winner...")
        
        try:
            response = requests.get(f"{self.api_url}/today-winner")
            self.log_info(f"GET /api/today-winner - Status: {response.status_code}")
            
            if response.status_code == 200:
                winner_data = response.json()
                
                if winner_data:
                    self.log_success(f"Current winner found!")
                    self.log_info(f"Winner ID: {winner_data.get('id')}")
                    self.log_info(f"Winner nickname: {winner_data.get('user_nickname')}")
                    self.log_info(f"Winner content: {winner_data.get('text_content', '')[:100]}...")
                    self.log_info(f"Is winner: {winner_data.get('is_winner')}")
                    self.log_info(f"Likes count: {winner_data.get('likes_count', 0)}")
                    self.log_info(f"Comments count: {winner_data.get('comments_count', 0)}")
                    
                    if 'winner_datetime' in winner_data:
                        self.log_info(f"Winner datetime: {winner_data.get('winner_datetime')}")
                    
                    return winner_data
                else:
                    self.log_info("No current winner found")
                    return None
            else:
                self.log_error(f"Failed to get winner. Status: {response.status_code}")
                if response.text:
                    self.log_error(f"Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_error(f"Exception getting winner: {str(e)}")
            return None

    def get_interactions_for_winner(self, winner_id):
        """Step 2: Get interactions for the winner"""
        self.log_info(f"Step 2: Getting interactions for winner {winner_id}...")
        
        try:
            response = requests.get(f"{self.api_url}/submissions/{winner_id}/interactions")
            self.log_info(f"GET /api/submissions/{winner_id}/interactions - Status: {response.status_code}")
            
            if response.status_code == 200:
                interactions = response.json()
                self.log_success(f"Retrieved {len(interactions)} interactions")
                
                return interactions
            else:
                self.log_error(f"Failed to get interactions. Status: {response.status_code}")
                if response.text:
                    self.log_error(f"Response: {response.text}")
                return []
                
        except Exception as e:
            self.log_error(f"Exception getting interactions: {str(e)}")
            return []

    def analyze_interactions(self, interactions):
        """Step 3: Analyze interactions and count comments"""
        self.log_info("Step 3: Analyzing interactions...")
        
        total_interactions = len(interactions)
        comments = []
        likes = []
        comment_likes = []
        
        for interaction in interactions:
            interaction_type = interaction.get('type')
            interaction_id = interaction.get('id')
            user_nickname = interaction.get('user_nickname')
            content = interaction.get('content')
            comment_id = interaction.get('comment_id')
            created_at = interaction.get('created_at')
            likes_count = interaction.get('likes_count')
            
            if interaction_type == 'comment':
                comments.append({
                    'id': interaction_id,
                    'user_nickname': user_nickname,
                    'content': content,
                    'created_at': created_at,
                    'likes_count': likes_count
                })
            elif interaction_type == 'like':
                if comment_id:  # This is a comment like
                    comment_likes.append({
                        'id': interaction_id,
                        'user_nickname': user_nickname,
                        'comment_id': comment_id,
                        'created_at': created_at
                    })
                else:  # This is a submission like
                    likes.append({
                        'id': interaction_id,
                        'user_nickname': user_nickname,
                        'created_at': created_at
                    })
        
        # Print summary
        self.log_info(f"📊 INTERACTION SUMMARY:")
        self.log_info(f"   Total interactions: {total_interactions}")
        self.log_info(f"   Comments: {len(comments)}")
        self.log_info(f"   Submission likes: {len(likes)}")
        self.log_info(f"   Comment likes: {len(comment_likes)}")
        
        # Print detailed comment information
        if comments:
            self.log_info(f"\n💬 DETAILED COMMENT DATA:")
            for i, comment in enumerate(comments, 1):
                self.log_info(f"   Comment {i}:")
                self.log_info(f"     ID: {comment['id']}")
                self.log_info(f"     User: {comment['user_nickname']}")
                self.log_info(f"     Content: {comment['content']}")
                self.log_info(f"     Created: {comment['created_at']}")
                self.log_info(f"     Likes count: {comment['likes_count']}")
                
                # Check if comment has proper required fields
                required_fields = ['id', 'user_nickname', 'content', 'created_at']
                missing_fields = [field for field in required_fields if not comment.get(field)]
                
                if missing_fields:
                    self.log_error(f"     Missing required fields: {missing_fields}")
                else:
                    self.log_success(f"     All required fields present")
        else:
            self.log_info("   No comments found")
        
        # Print comment likes if any
        if comment_likes:
            self.log_info(f"\n👍 COMMENT LIKES:")
            for i, like in enumerate(comment_likes, 1):
                self.log_info(f"   Like {i}:")
                self.log_info(f"     ID: {like['id']}")
                self.log_info(f"     User: {like['user_nickname']}")
                self.log_info(f"     Comment ID: {like['comment_id']}")
                self.log_info(f"     Created: {like['created_at']}")
        
        return {
            'total_interactions': total_interactions,
            'comments': comments,
            'submission_likes': likes,
            'comment_likes': comment_likes
        }

    def verify_api_functionality(self, winner_id):
        """Step 4: Verify the interactions API is working correctly"""
        self.log_info("Step 4: Verifying API functionality...")
        
        # Test the endpoint multiple times to ensure consistency
        for attempt in range(3):
            self.log_info(f"   API test attempt {attempt + 1}/3")
            
            try:
                response = requests.get(f"{self.api_url}/submissions/{winner_id}/interactions")
                
                if response.status_code == 200:
                    interactions = response.json()
                    self.log_success(f"   Attempt {attempt + 1}: Got {len(interactions)} interactions")
                    
                    # Verify response structure
                    if isinstance(interactions, list):
                        self.log_success(f"   Response is properly formatted as list")
                        
                        # Check first interaction structure if exists
                        if interactions:
                            first_interaction = interactions[0]
                            expected_fields = ['id', 'type', 'user_nickname', 'created_at']
                            
                            present_fields = [field for field in expected_fields if field in first_interaction]
                            self.log_info(f"   First interaction has fields: {present_fields}")
                            
                            if len(present_fields) == len(expected_fields):
                                self.log_success(f"   Interaction structure is correct")
                            else:
                                missing = [field for field in expected_fields if field not in first_interaction]
                                self.log_error(f"   Missing fields in interaction: {missing}")
                    else:
                        self.log_error(f"   Response is not a list: {type(interactions)}")
                else:
                    self.log_error(f"   Attempt {attempt + 1}: Status {response.status_code}")
                    
            except Exception as e:
                self.log_error(f"   Attempt {attempt + 1}: Exception {str(e)}")

    def run_verification(self):
        """Run the complete verification process"""
        print("🔍 COMMENTS VERIFICATION TEST")
        print("=" * 60)
        print("Focus: Verify comments exist in database and interactions API is working")
        print("=" * 60)
        
        # Step 1: Get current winner
        winner = self.get_current_winner()
        
        if not winner:
            self.log_error("Cannot proceed without a current winner")
            print("\n❌ VERIFICATION FAILED: No current winner found")
            return False
        
        winner_id = winner.get('id')
        
        # Step 2: Get interactions for winner
        interactions = self.get_interactions_for_winner(winner_id)
        
        if not interactions:
            self.log_error("No interactions found for winner")
            print(f"\n❌ VERIFICATION FAILED: No interactions found for winner {winner_id}")
            return False
        
        # Step 3: Analyze interactions
        analysis = self.analyze_interactions(interactions)
        
        # Step 4: Verify API functionality
        self.verify_api_functionality(winner_id)
        
        # Final summary
        print("\n" + "=" * 60)
        print("📋 FINAL VERIFICATION SUMMARY")
        print("=" * 60)
        
        comments_count = len(analysis['comments'])
        
        print(f"✅ Current winner found: {winner.get('user_nickname')}")
        print(f"✅ Interactions API working: Retrieved {analysis['total_interactions']} interactions")
        print(f"✅ Comments found: {comments_count}")
        print(f"✅ Submission likes: {len(analysis['submission_likes'])}")
        print(f"✅ Comment likes: {len(analysis['comment_likes'])}")
        
        # Answer the specific questions from the review request
        print(f"\n🎯 ANSWERS TO REVIEW QUESTIONS:")
        print(f"   Q: Are there actually 5 comments in the database?")
        if comments_count == 5:
            print(f"   A: ✅ YES - Found exactly 5 comments")
        else:
            print(f"   A: ❌ NO - Found {comments_count} comments (expected 5)")
        
        print(f"   Q: Is the interactions API returning the correct data?")
        if analysis['total_interactions'] > 0:
            print(f"   A: ✅ YES - API returned {analysis['total_interactions']} interactions")
        else:
            print(f"   A: ❌ NO - API returned no interactions")
        
        print(f"   Q: Are the comments properly formatted with all required fields?")
        properly_formatted = True
        for comment in analysis['comments']:
            required_fields = ['id', 'user_nickname', 'content', 'created_at']
            if not all(comment.get(field) for field in required_fields):
                properly_formatted = False
                break
        
        if properly_formatted and comments_count > 0:
            print(f"   A: ✅ YES - All comments have required fields")
        else:
            print(f"   A: ❌ NO - Some comments missing required fields or no comments found")
        
        # Overall result
        if comments_count > 0 and analysis['total_interactions'] > 0 and properly_formatted:
            print(f"\n🎉 OVERALL VERIFICATION: ✅ PASSED")
            return True
        else:
            print(f"\n💥 OVERALL VERIFICATION: ❌ FAILED")
            return False

def main():
    tester = CommentsVerificationTester()
    success = tester.run_verification()
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())