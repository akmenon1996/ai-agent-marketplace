from openai import AsyncOpenAI
from typing import Dict, Any
from src.agents.base_agent import BaseAgent
from src.config import get_settings

class TechnicalTroubleshooterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Technical Troubleshooter",
            description="AI-powered technical troubleshooting agent",
            price_per_token=0.0002  # $0.0002 per token
        )
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_request(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the input request and return troubleshooting steps
        
        :param input_data: Dictionary containing input parameters (issue, system_info, context)
        :return: Dictionary with troubleshooting steps and token usage
        """
        try:
            issue = input_data.get("issue", "")
            system_info = input_data.get("system_info", "")
            context = input_data.get("context", "")

            # Build the prompt
            prompt = f"Please help troubleshoot this technical issue: {issue}"
            if system_info:
                prompt += f"\nSystem Info: {system_info}"
            if context:
                prompt += f"\nAdditional Context: {context}"

            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a technical troubleshooting expert."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000
            )

            # Extract response and token usage
            troubleshooting_steps = response.choices[0].message.content
            token_usage = {
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens
            }

            return {
                "troubleshooting_steps": troubleshooting_steps,
                "token_usage": token_usage,
                "cost": self.calculate_token_cost(
                    token_usage["input_tokens"],
                    token_usage["output_tokens"]
                )
            }

        except Exception as e:
            return {
                "error": str(e),
                "token_usage": {"input_tokens": 0, "output_tokens": 0},
                "cost": 0
            }
