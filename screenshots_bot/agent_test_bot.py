from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime
import os

class AgentTestBot:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        self.wait = WebDriverWait(self.driver, 20)  # Increased wait time
        self.test_results = []
        self.screenshot_dir = "screenshots"
        os.makedirs(self.screenshot_dir, exist_ok=True)

    def take_screenshot(self, name):
        """Take a screenshot and save it with a timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.screenshot_dir}/{timestamp}_{name}.png"
        self.driver.save_screenshot(filename)
        print(f"Screenshot saved: {filename}")

    def login(self, username, password):
        try:
            print("Logging in...")
            
            # Clear any existing session
            self.driver.delete_all_cookies()
            
            # Navigate to home first
            print("Navigating to home page...")
            self.driver.get(self.base_url)
            time.sleep(3)
            self.take_screenshot("home_page")
            
            # Then navigate to login
            print("Navigating to login page...")
            self.driver.get(f"{self.base_url}/login")
            time.sleep(3)
            self.take_screenshot("login_page_before")
            
            # Print current URL for debugging
            print(f"Current URL: {self.driver.current_url}")
            
            # Wait for the login form to be present
            print("Waiting for login form...")
            self.wait.until(
                EC.presence_of_element_located((By.TAG_NAME, "form"))
            )
            
            # Find and fill login form using XPath
            print("Looking for username field...")
            username_field = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'MuiFormControl-root')]//input"))
            )
            print("Found username field")
            
            print("Looking for password field...")
            password_field = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'MuiFormControl-root')]//input[@type='password']"))
            )
            print("Found password field")
            
            # Clear fields first
            username_field.clear()
            password_field.clear()
            time.sleep(1)
            
            print(f"Entering credentials for user: {username}")
            # Use JavaScript to set values
            self.driver.execute_script("arguments[0].value = arguments[1]", username_field, username)
            time.sleep(1)
            self.driver.execute_script("arguments[0].value = arguments[1]", password_field, password)
            time.sleep(1)
            
            # Take screenshot after entering credentials
            self.take_screenshot("login_page_with_credentials")
            
            # Trigger input events
            self.driver.execute_script("arguments[0].dispatchEvent(new Event('input'))", username_field)
            self.driver.execute_script("arguments[0].dispatchEvent(new Event('input'))", password_field)
            time.sleep(1)
            
            # Find and click the submit button
            print("Looking for submit button...")
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            print("Found submit button")
            
            # Click using JavaScript
            self.driver.execute_script("arguments[0].click()", submit_button)
            print("Clicked submit button")
            
            # Take screenshot after clicking submit
            self.take_screenshot("login_submit_clicked")
            
            # Wait for dashboard
            print("Waiting for dashboard...")
            self.wait.until(EC.url_contains("/dashboard"))
            time.sleep(3)
            
            # Take screenshot of dashboard
            self.take_screenshot("dashboard_after_login")
            print("Successfully logged in!")
            
        except Exception as e:
            print(f"Login failed with error: {str(e)}")
            print(f"Current URL: {self.driver.current_url}")
            # Take screenshot of error state
            self.take_screenshot("login_error_state")
            raise

    def navigate_to_agent(self, agent_id):
        """Navigate to an agent's page by clicking its card in the marketplace"""
        try:
            print(f"\nNavigating to agent {agent_id}...")
            self.driver.get(f"{self.base_url}/marketplace")
            time.sleep(2)
            
            # Find and click the agent card
            agent_cards = self.wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".MuiCard-root"))
            )
            
            for card in agent_cards:
                try:
                    title = card.find_element(By.CSS_SELECTOR, ".MuiTypography-h5").text.lower()
                    if agent_id in title.replace(" ", "-"):
                        card.click()
                        time.sleep(2)
                        self.take_screenshot(f"agent_{agent_id}_page")
                        return True
                except:
                    continue
            
            print(f"Could not find agent card for {agent_id}")
            return False
            
        except Exception as e:
            print(f"Error navigating to agent: {str(e)}")
            return False

    def test_code_review_agent(self):
        try:
            print("\nTesting Code Review Agent...")
            if not self.navigate_to_agent("code-review"):
                raise Exception("Could not navigate to Code Review Agent")
                
            sample_code = '''
def calculate_sum(numbers):
    sum = 0
    for i in range(len(numbers)):
        sum += numbers[i]
    return sum
            '''
            
            # Find and fill the code input
            code_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea"))
            )
            code_input.send_keys(sample_code)
            
            # Take screenshot of code input
            self.take_screenshot("code_review_code_input")
            
            # Submit for review
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            submit_button.click()
            
            # Take screenshot after submitting code
            self.take_screenshot("code_review_submit_clicked")
            
            # Wait for and capture the response
            time.sleep(10)  # Allow time for API response
            response_element = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiPaper-root"))
            )
            response = response_element.text
            
            # Take screenshot of response
            self.take_screenshot("code_review_response")
            
            self.test_results.append({
                "agent": "Code Review",
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "response": response
            })
            print("Code Review Agent test completed!")
            
        except Exception as e:
            print(f"Code Review Agent test failed: {str(e)}")
            self.test_results.append({
                "agent": "Code Review",
                "status": "failed",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })

    def test_resume_reviewer_agent(self):
        try:
            print("\nTesting Resume Reviewer Agent...")
            if not self.navigate_to_agent("resume-reviewer"):
                raise Exception("Could not navigate to Resume Reviewer Agent")
                
            sample_resume = '''
John Doe
Software Engineer

Experience:
- Senior Developer at Tech Corp (2020-Present)
- Full Stack Engineer at StartUp Inc (2018-2020)

Skills:
- Python, JavaScript, React
- AWS, Docker, Kubernetes
            '''
            
            # Find and fill the resume input
            resume_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea"))
            )
            resume_input.send_keys(sample_resume)
            
            # Take screenshot of resume input
            self.take_screenshot("resume_reviewer_resume_input")
            
            # Submit for review
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            submit_button.click()
            
            # Take screenshot after submitting resume
            self.take_screenshot("resume_reviewer_submit_clicked")
            
            # Wait for and capture the response
            time.sleep(10)  # Allow time for API response
            response_element = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiPaper-root"))
            )
            response = response_element.text
            
            # Take screenshot of response
            self.take_screenshot("resume_reviewer_response")
            
            self.test_results.append({
                "agent": "Resume Reviewer",
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "response": response
            })
            print("Resume Reviewer Agent test completed!")
            
        except Exception as e:
            print(f"Resume Reviewer Agent test failed: {str(e)}")
            self.test_results.append({
                "agent": "Resume Reviewer",
                "status": "failed",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })

    def test_interview_prep_agent(self):
        try:
            print("\nTesting Interview Prep Agent...")
            if not self.navigate_to_agent("interview-prep"):
                raise Exception("Could not navigate to Interview Prep Agent")
                
            sample_query = "Prepare me for a Senior Software Engineer interview at Google"
            
            # Find and fill the query input
            query_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea"))
            )
            query_input.send_keys(sample_query)
            
            # Take screenshot of query input
            self.take_screenshot("interview_prep_query_input")
            
            # Submit query
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            submit_button.click()
            
            # Take screenshot after submitting query
            self.take_screenshot("interview_prep_submit_clicked")
            
            # Wait for and capture the response
            time.sleep(10)  # Allow time for API response
            response_element = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiPaper-root"))
            )
            response = response_element.text
            
            # Take screenshot of response
            self.take_screenshot("interview_prep_response")
            
            self.test_results.append({
                "agent": "Interview Prep",
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "response": response
            })
            print("Interview Prep Agent test completed!")
            
        except Exception as e:
            print(f"Interview Prep Agent test failed: {str(e)}")
            self.test_results.append({
                "agent": "Interview Prep",
                "status": "failed",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })

    def test_writing_assistant_agent(self):
        try:
            print("\nTesting Writing Assistant Agent...")
            if not self.navigate_to_agent("writing-assistant"):
                raise Exception("Could not navigate to Writing Assistant Agent")
                
            sample_text = "Write a professional email to schedule a meeting with a client"
            
            # Find and fill the text input
            text_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea"))
            )
            text_input.send_keys(sample_text)
            
            # Take screenshot of text input
            self.take_screenshot("writing_assistant_text_input")
            
            # Submit for assistance
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            submit_button.click()
            
            # Take screenshot after submitting text
            self.take_screenshot("writing_assistant_submit_clicked")
            
            # Wait for and capture the response
            time.sleep(10)  # Allow time for API response
            response_element = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiPaper-root"))
            )
            response = response_element.text
            
            # Take screenshot of response
            self.take_screenshot("writing_assistant_response")
            
            self.test_results.append({
                "agent": "Writing Assistant",
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "response": response
            })
            print("Writing Assistant Agent test completed!")
            
        except Exception as e:
            print(f"Writing Assistant Agent test failed: {str(e)}")
            self.test_results.append({
                "agent": "Writing Assistant",
                "status": "failed",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })

    def test_technical_troubleshooting_agent(self):
        try:
            print("\nTesting Technical Troubleshooting Agent...")
            if not self.navigate_to_agent("technical-troubleshooting"):
                raise Exception("Could not navigate to Technical Troubleshooting Agent")
                
            sample_issue = "Docker container keeps crashing with OOM error"
            
            # Find and fill the issue input
            issue_input = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//textarea"))
            )
            issue_input.send_keys(sample_issue)
            
            # Take screenshot of issue input
            self.take_screenshot("technical_troubleshooting_issue_input")
            
            # Submit for troubleshooting
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            submit_button.click()
            
            # Take screenshot after submitting issue
            self.take_screenshot("technical_troubleshooting_submit_clicked")
            
            # Wait for and capture the response
            time.sleep(10)  # Allow time for API response
            response_element = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiPaper-root"))
            )
            response = response_element.text
            
            # Take screenshot of response
            self.take_screenshot("technical_troubleshooting_response")
            
            self.test_results.append({
                "agent": "Technical Troubleshooting",
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "response": response
            })
            print("Technical Troubleshooting Agent test completed!")
            
        except Exception as e:
            print(f"Technical Troubleshooting Agent test failed: {str(e)}")
            self.test_results.append({
                "agent": "Technical Troubleshooting",
                "status": "failed",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })

    def save_test_results(self):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"test_results_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\nTest results saved to {filename}")

    def run_all_tests(self):
        try:
            print("=== Starting Agent Tests ===")
            self.login("testdev", "testpass123")
            
            # Test each agent
            self.test_code_review_agent()
            self.test_resume_reviewer_agent()
            self.test_interview_prep_agent()
            self.test_writing_assistant_agent()
            self.test_technical_troubleshooting_agent()
            
            # Save results
            self.save_test_results()
            print("=== All Tests Completed ===")
            
        except Exception as e:
            print(f"Error during tests: {str(e)}")
        finally:
            self.driver.quit()

if __name__ == "__main__":
    bot = AgentTestBot()
    bot.run_all_tests()
