from openai import AsyncOpenAI
from typing import Dict, Any
from .base_agent import BaseAgent
from ..config import get_settings

class WritingAssistantAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Writing Assistant",
            description="AI-powered writing improvement agent",
            price_per_token=0.0002  # $0.0002 per token
        )
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_request(self, text: str, style: str = None, context: str = None) -> Dict[str, Any]:
        """
        Review and improve writing
        
        :param text: The text to review and improve
        :param style: The desired writing style (e.g., formal, casual, academic)
        :param context: Additional context about the writing
        :return: Dictionary with improved text and token usage
        """
        try:
            # Build the prompt with style and context if provided
            prompt = "Please review and improve this text"
            if style:
                prompt += f" in a {style} style"
            if context:
                prompt += f" with this additional context: {context}"
            prompt += f":\n\n{text}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert writing assistant. Provide detailed feedback and improvements focusing on: 1) Clarity & Coherence, 2) Grammar & Style, 3) Tone & Voice, and 4) Specific Suggestions for Enhancement."},
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
            raise Exception(f"Error in writing assistance: {str(e)}")
