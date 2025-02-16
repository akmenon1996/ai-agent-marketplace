from openai import AsyncOpenAI
from typing import Dict, Any
from .base_agent import BaseAgent
from ..config import get_settings

class InterviewPrepAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Interview Prep",
            description="AI-powered interview preparation agent",
            price_per_token=0.0002  # $0.0002 per token
        )
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_request(self, topic: str, experience_level: str = "entry", context: str = None) -> Dict[str, Any]:
        """
        Prepare interview questions and answers
        
        :param topic: The topic or role to prepare for
        :param experience_level: The experience level (entry, mid, senior)
        :param context: Additional context about the interview
        :return: Dictionary with interview prep content and token usage
        """
        try:
            # Build the prompt with context if provided
            prompt = f"Please prepare interview questions and answers for a {experience_level} level {topic} position"
            if context:
                prompt += f" with this additional context: {context}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer. Provide detailed interview preparation focusing on: 1) Common Questions & Best Answers, 2) Technical Concepts to Review, 3) Coding Problems to Practice, and 4) Tips for Success."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            output = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return {
                "output_text": output,
                "tokens_used": tokens_used
            }
        
        except Exception as e:
            raise Exception(f"Error in interview prep: {str(e)}")
