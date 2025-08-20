#!/usr/bin/env python3
"""
Backend API Testing Suite for Contact Form Endpoints
Tests the contact form functionality including validation, database storage, and retrieval.
"""

import requests
import json
import sys
import os
from datetime import datetime
import uuid

# Get backend URL from frontend environment
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BASE_URL = get_backend_url() + "/api"
print(f"Testing backend at: {BASE_URL}")

class ContactFormTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.created_contacts = []
    
    def log_test(self, test_name, passed, details=""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
    
    def test_hello_endpoint(self):
        """Test basic connectivity with hello endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200 and "Hello World" in response.text:
                self.log_test("Basic connectivity (GET /api/)", True, f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Basic connectivity (GET /api/)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Basic connectivity (GET /api/)", False, f"Connection error: {str(e)}")
            return False
    
    def test_valid_contact_form_submission(self):
        """Test POST /api/contact with valid data"""
        valid_data = {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "+1-555-123-4567",
            "subject": "Business Inquiry",
            "message": "I'm interested in your services and would like to discuss a potential project."
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                json=valid_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                # Verify response structure
                required_fields = ["id", "name", "email", "subject", "message", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.created_contacts.append(data["id"])
                    self.log_test("Valid contact form submission", True, f"Contact ID: {data['id']}")
                    return True
                else:
                    self.log_test("Valid contact form submission", False, f"Missing fields in response: {missing_fields}")
                    return False
            else:
                self.log_test("Valid contact form submission", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Valid contact form submission", False, f"Request error: {str(e)}")
            return False
    
    def test_email_validation(self):
        """Test email validation"""
        invalid_emails = [
            "invalid-email",
            "test@",
            "@example.com",
            "test..test@example.com",
            ""
        ]
        
        passed_tests = 0
        total_tests = len(invalid_emails)
        
        for invalid_email in invalid_emails:
            test_data = {
                "name": "Test User",
                "email": invalid_email,
                "subject": "Test Subject",
                "message": "Test message"
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/contact",
                    json=test_data,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                # Should return 422 for validation error
                if response.status_code == 422:
                    passed_tests += 1
                else:
                    print(f"   Invalid email '{invalid_email}' was accepted (Status: {response.status_code})")
            except Exception as e:
                print(f"   Error testing email '{invalid_email}': {str(e)}")
        
        success = passed_tests == total_tests
        self.log_test("Email validation", success, f"Rejected {passed_tests}/{total_tests} invalid emails")
        return success
    
    def test_required_field_validation(self):
        """Test required field validation"""
        required_fields = ["name", "email", "subject", "message"]
        passed_tests = 0
        
        for field in required_fields:
            # Create valid data then remove the required field
            test_data = {
                "name": "Test User",
                "email": "test@example.com",
                "subject": "Test Subject",
                "message": "Test message"
            }
            del test_data[field]
            
            try:
                response = requests.post(
                    f"{self.base_url}/contact",
                    json=test_data,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                # Should return 422 for missing required field
                if response.status_code == 422:
                    passed_tests += 1
                else:
                    print(f"   Missing required field '{field}' was accepted (Status: {response.status_code})")
            except Exception as e:
                print(f"   Error testing missing field '{field}': {str(e)}")
        
        success = passed_tests == len(required_fields)
        self.log_test("Required field validation", success, f"Rejected {passed_tests}/{len(required_fields)} requests with missing required fields")
        return success
    
    def test_optional_phone_field(self):
        """Test that phone field is optional"""
        # Test without phone field
        test_data = {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "subject": "Optional Phone Test",
            "message": "Testing submission without phone number"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.created_contacts.append(data["id"])
                # Phone should be null or not present
                phone_value = data.get("phone")
                if phone_value is None:
                    self.log_test("Optional phone field handling", True, "Phone field correctly optional")
                    return True
                else:
                    self.log_test("Optional phone field handling", False, f"Phone field has unexpected value: {phone_value}")
                    return False
            else:
                self.log_test("Optional phone field handling", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Optional phone field handling", False, f"Request error: {str(e)}")
            return False
    
    def test_get_contact_forms(self):
        """Test GET /api/contact endpoint"""
        try:
            response = requests.get(f"{self.base_url}/contact", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if our created contacts are in the response
                    contact_ids = [contact.get("id") for contact in data]
                    found_contacts = [cid for cid in self.created_contacts if cid in contact_ids]
                    
                    if len(found_contacts) > 0:
                        self.log_test("GET contact forms", True, f"Retrieved {len(data)} contacts, found {len(found_contacts)} test contacts")
                        return True
                    else:
                        self.log_test("GET contact forms", False, f"Retrieved {len(data)} contacts but none of our test contacts found")
                        return False
                else:
                    self.log_test("GET contact forms", False, f"Response is not a list: {type(data)}")
                    return False
            else:
                self.log_test("GET contact forms", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("GET contact forms", False, f"Request error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for malformed requests"""
        # Test with completely invalid JSON
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                data="invalid json",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should return 422 or 400 for malformed JSON
            if response.status_code in [400, 422]:
                self.log_test("Error handling (malformed JSON)", True, f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Error handling (malformed JSON)", False, f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Error handling (malformed JSON)", False, f"Request error: {str(e)}")
            return False
    
    def test_emailjs_integration(self):
        """Test EmailJS integration with specific review request data"""
        print("\n--- Testing EmailJS Integration ---")
        
        # Use the exact data from the review request
        emailjs_test_data = {
            "name": "Test EmailJS Integration",
            "email": "test.emailjs@example.com",
            "phone": "06 12 34 56 78",
            "subject": "audit",
            "message": "Test message to verify EmailJS dual email functionality: notification to Alesium + auto-reply confirmation to client."
        }
        
        try:
            print(f"Sending EmailJS test request to: {self.base_url}/contact")
            print(f"Test data: {json.dumps(emailjs_test_data, indent=2)}")
            
            response = requests.post(
                f"{self.base_url}/contact",
                json=emailjs_test_data,
                headers={"Content-Type": "application/json"},
                timeout=30  # Longer timeout for email processing
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response data: {json.dumps(data, indent=2)}")
                
                # Verify response structure
                required_fields = ["id", "name", "email", "subject", "message", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.created_contacts.append(data["id"])
                    
                    # Verify the data matches what we sent
                    data_matches = (
                        data["name"] == emailjs_test_data["name"] and
                        data["email"] == emailjs_test_data["email"] and
                        data["phone"] == emailjs_test_data["phone"] and
                        data["subject"] == emailjs_test_data["subject"] and
                        data["message"] == emailjs_test_data["message"]
                    )
                    
                    if data_matches:
                        self.log_test("EmailJS Integration - Data Storage", True, 
                                    f"Contact stored successfully with ID: {data['id']}")
                        
                        # Note: EmailJS email sending happens in background task
                        # We can't directly verify email delivery in this test
                        # But we can verify the API accepts the request and stores data
                        self.log_test("EmailJS Integration - API Response", True, 
                                    "API successfully processed EmailJS contact form submission")
                        return True
                    else:
                        self.log_test("EmailJS Integration - Data Validation", False, 
                                    "Stored data doesn't match submitted data")
                        return False
                else:
                    self.log_test("EmailJS Integration - Response Structure", False, 
                                f"Missing fields in response: {missing_fields}")
                    return False
            else:
                self.log_test("EmailJS Integration - API Call", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("EmailJS Integration - Request Error", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all contact form tests"""
        print("=" * 60)
        print("CONTACT FORM BACKEND API TESTING")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_hello_endpoint():
            print("\n❌ CRITICAL: Cannot connect to backend. Stopping tests.")
            return False
        
        print("\n--- Testing Contact Form Endpoints ---")
        
        # Run all contact form tests
        tests = [
            self.test_valid_contact_form_submission,
            self.test_email_validation,
            self.test_required_field_validation,
            self.test_optional_phone_field,
            self.test_get_contact_forms,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"RESULTS: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Contact form backend is working correctly!")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Contact form backend has issues")
            return False

def main():
    """Main test execution"""
    tester = ContactFormTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Contact form backend testing completed successfully!")
        sys.exit(0)
    else:
        print("\n⚠️  Contact form backend testing found issues that need attention.")
        sys.exit(1)

if __name__ == "__main__":
    main()