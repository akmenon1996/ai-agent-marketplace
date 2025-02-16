# Screenshot Bot

This bot automatically navigates through web pages and captures screenshots of different components.

## Setup

1. Install Python 3.7 or higher
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Open `screenshot_bot.py` and modify the `target_url` variable with your desired URL
2. Add specific selectors and navigation logic in the `navigate_and_capture` method
3. Run the bot:
   ```
   python screenshot_bot.py
   ```

Screenshots will be saved in the `screenshots` directory with timestamps.

## Requirements

- Chrome browser installed
- Python 3.7+
- Internet connection
- Required Python packages (listed in requirements.txt)
