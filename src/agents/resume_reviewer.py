from openai import AsyncOpenAI
from typing import Dict, Any
from .base_agent import BaseAgent
from ..config import get_settings

class ResumeReviewerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Resume Reviewer",
            description="AI-powered resume review and improvement agent",
            price_per_token=0.0002  # $0.0002 per token
        )
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_request(self, resume_text: str, context: str = None) -> Dict[str, Any]:
        """
        Review and provide feedback on a resume
        
        :param resume_text: The resume text to review
        :param context: Additional context about the position or industry
        :return: Dictionary with review output and token usage
        """
        try:
            # Build the prompt with context if provided
            prompt = "Please review this resume"
            if context:
                prompt += f" for a {context} position"
            prompt += f":\n\n{resume_text}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert resume reviewer. Provide detailed, constructive feedback focusing on: 1) Content & Impact, 2) Structure & Organization, 3) Language & Clarity, and 4) Specific suggestions for improvement."},
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
            raise Exception(f"Error in resume review: {str(e)}")
