from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import os
import time
from datetime import datetime
import json

class AIMarketplaceBot:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.setup_driver()
        self.screenshot_dir = os.path.join(os.path.dirname(__file__), 'screenshots')
        os.makedirs(self.screenshot_dir, exist_ok=True)

    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_argument("--disable-extensions")
        
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        self.wait = WebDriverWait(self.driver, 10)

    def take_screenshot(self, name):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(self.screenshot_dir, filename)
        time.sleep(1)  # Small delay to ensure UI is fully loaded
        self.driver.save_screenshot(filepath)
        print(f"Screenshot saved: {filepath}")

    def login(self, username, password):
        try:
            print("Navigating to login page...")
            self.driver.get(f"{self.base_url}/login")  # Updated URL path
            time.sleep(5)  # Increased wait time for page load
            
            # Take screenshot of login page
            self.take_screenshot("01_login_page")
            
            print("Looking for login form elements...")
            # Wait for form elements with Material-UI specific selectors
            username_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[autocomplete='username']"))
            )
            password_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[autocomplete='current-password']"))
            )
            
            print(f"Entering credentials for user: {username}")
            username_field.clear()
            username_field.send_keys(username)
            time.sleep(1)
            
            password_field.clear()
            password_field.send_keys(password)
            time.sleep(1)
            
            # Take screenshot of filled login form
            self.take_screenshot("02_login_form_filled")
            
            print("Submitting login form...")
            # Find and click the submit button using Material-UI button selector
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
            )
            submit_button.click()
            
            # Wait for dashboard to load with longer timeout
            print("Waiting for dashboard...")
            WebDriverWait(self.driver, 20).until(
                EC.url_contains("/dashboard")
            )
            time.sleep(3)
            self.take_screenshot("03_dashboard")
            print("Successfully logged in!")
            
        except Exception as e:
            print(f"Error during login: {str(e)}")
            print(f"Current URL: {self.driver.current_url}")
            self.take_screenshot("error_login")
            raise

    def capture_marketplace(self):
        try:
            # Navigate to marketplace
            print("  Navigating to marketplace...")
            self.driver.get(f"{self.base_url}/marketplace")
            time.sleep(3)
            self.take_screenshot("04_marketplace_overview")
            
            # Find and capture individual agent cards
            print("  Looking for agent cards...")
            agent_cards = self.wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".MuiCard-root"))
            )
            
            print(f"  Found {len(agent_cards)} agent cards")
            for idx, card in enumerate(agent_cards):
                print(f"  Processing agent card {idx + 1}/{len(agent_cards)}")
                
                # Get agent name before clicking
                try:
                    agent_name = card.find_element(By.CSS_SELECTOR, ".MuiTypography-h5").text.lower().replace(" ", "_")
                except:
                    agent_name = f"agent_{idx}"
                
                # Scroll card into view and capture
                card.location_once_scrolled_into_view
                time.sleep(1)
                self.take_screenshot(f"05_{agent_name}_card")
                
                # Click on card to view details
                print(f"  Viewing details for {agent_name}")
                card.click()
                time.sleep(2)
                
                # Capture the agent details page
                self.take_screenshot(f"06_{agent_name}_details")
                
                # Try to find and capture the agent interface
                try:
                    # Look for specific agent interface elements
                    interface_section = self.wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiContainer-root form"))
                    )
                    interface_section.location_once_scrolled_into_view
                    time.sleep(1)
                    self.take_screenshot(f"07_{agent_name}_interface")
                    
                    # If there's a sample input section, capture that too
                    try:
                        sample_section = self.driver.find_element(By.CSS_SELECTOR, ".MuiBox-root")
                        sample_section.location_once_scrolled_into_view
                        time.sleep(1)
                        self.take_screenshot(f"08_{agent_name}_sample")
                    except:
                        print(f"    No sample section found for {agent_name}")
                except:
                    print(f"    No interface section found for {agent_name}")
                
                # Go back to marketplace
                print(f"  Returning to marketplace from {agent_name}")
                self.driver.back()
                time.sleep(2)
                
        except Exception as e:
            print(f"Error capturing marketplace: {str(e)}")
            self.take_screenshot("error_marketplace")
            raise

    def capture_profile(self):
        try:
            # Navigate to profile
            print("  Navigating to profile...")
            self.driver.get(f"{self.base_url}/profile")
            time.sleep(3)
            self.take_screenshot("07_profile_page")
            
            # Capture token balance section
            print("  Looking for token balance...")
            token_section = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='token-balance']"))
            )
            token_section.location_once_scrolled_into_view
            time.sleep(1)
            self.take_screenshot("08_token_balance")
            
        except Exception as e:
            print(f"Error capturing profile: {str(e)}")
            self.take_screenshot("error_profile")
            raise

    def capture_history(self):
        try:
            # Navigate to history
            print("  Navigating to history...")
            self.driver.get(f"{self.base_url}/history")
            time.sleep(3)
            self.take_screenshot("09_history_page")
            
            # Capture invocation history if any exists
            print("  Looking for invocations...")
            invocations = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='invocation-item']")
            if invocations:
                print(f"  Found {len(invocations)} invocations")
                invocations[0].location_once_scrolled_into_view
                time.sleep(1)
                self.take_screenshot("10_invocation_history")
                
                # Click to expand first invocation
                invocations[0].click()
                time.sleep(2)
                self.take_screenshot("11_invocation_details")
            else:
                print("  No invocations found")
            
        except Exception as e:
            print(f"Error capturing history: {str(e)}")
            self.take_screenshot("error_history")
            raise

    def run_full_capture(self, username, password):
        try:
            print("\n=== Starting Full Capture Process ===")
            
            # Step 1: Login
            print("\n1. Logging in...")
            self.login(username, password)
            time.sleep(3)  # Wait for any post-login redirects
            
            # Step 2: Capture Marketplace
            print("\n2. Capturing Marketplace...")
            try:
                self.capture_marketplace()
            except Exception as e:
                print(f"Error in marketplace capture: {str(e)}")
                self.take_screenshot("error_marketplace")
            
            # Step 3: Capture Profile
            print("\n3. Capturing Profile...")
            try:
                self.capture_profile()
            except Exception as e:
                print(f"Error in profile capture: {str(e)}")
                self.take_screenshot("error_profile")
            
            # Step 4: Capture History
            print("\n4. Capturing History...")
            try:
                self.capture_history()
            except Exception as e:
                print(f"Error in history capture: {str(e)}")
                self.take_screenshot("error_history")
            
            print("\n=== Full Capture Process Completed ===")
            
        except Exception as e:
            print(f"\nError during full capture: {str(e)}")
            print(f"Current URL: {self.driver.current_url}")
        finally:
            print("\nClosing browser...")
            self.close()

    def close(self):
        self.driver.quit()

def main():
    bot = AIMarketplaceBot()
    try:
        # Replace with actual credentials
        username = "testdev"
        password = "testpass123"
        bot.run_full_capture(username, password)
    except Exception as e:
        print(f"Error in main: {str(e)}")
        bot.close()

if __name__ == "__main__":
    main()
