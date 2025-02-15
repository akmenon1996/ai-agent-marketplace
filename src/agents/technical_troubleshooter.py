from openai import AsyncOpenAI
from typing import Dict, Any
from .base_agent import BaseAgent
from ..config import get_settings

class TechnicalTroubleshooterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Technical Troubleshooter",
            description="AI-powered technical troubleshooting agent",
            price_per_token=0.0002  # $0.0002 per token
        )
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_request(self, issue: str, system_info: str = None, context: str = None) -> Dict[str, Any]:
        """
        Troubleshoot technical issues
        
        :param issue: The technical issue to troubleshoot
        :param system_info: Information about the system environment
        :param context: Additional context about the issue
        :return: Dictionary with troubleshooting steps and token usage
        """
        try:
            # Build the prompt with system info and context if provided
            prompt = f"Please help troubleshoot this technical issue: {issue}"
            if system_info:
                prompt += f"\nSystem Info: {system_info}"
            if context:
                prompt += f"\nAdditional Context: {context}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert technical troubleshooter. Provide detailed troubleshooting guidance focusing on: 1) Issue Analysis, 2) Potential Causes, 3) Step-by-Step Solutions, and 4) Prevention Tips."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            output = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return {
                "output": output,
                "tokens_used": tokens_used
            }
        
        except Exception as e:
            raise Exception(f"Error in technical troubleshooting: {str(e)}")
