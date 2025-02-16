import openai
from openai import AsyncOpenAI
from typing import Dict, Any
from .base_agent import BaseAgent
from ..config import get_settings

class CodeReviewAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Code Reviewer",
            description="AI-powered code review and improvement agent",
            price_per_token=0.0002  # $0.0002 per token
        )
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_request(self, code: str, language: str = "python", context: str = None) -> Dict[str, Any]:
        """
        Review and provide feedback on code
        
        :param code: The code to review
        :param language: The programming language of the code
        :param context: Additional context about the code
        :return: Dictionary with review output and token usage
        """
        try:
            # Build the prompt with context if provided
            prompt = f"Please review this {language} code"
            if context:
                prompt += f" with the following context: {context}"
            prompt += f":\n\n{code}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": f"You are an expert code reviewer for {language} programming language. Provide detailed, constructive feedback focusing on: 1) Correctness, 2) Efficiency, 3) Style, and 4) Specific suggestions for improvement."},
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
            raise Exception(f"Error in code review: {str(e)}")
