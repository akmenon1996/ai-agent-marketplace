from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self, name: str, description: str, price_per_token: float):
        self.name = name
        self.description = description
        self.price_per_token = price_per_token

    @abstractmethod
    async def process_request(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the input request and return the agent's response.
        
        :param input_data: Dictionary containing input parameters
        :return: Dictionary containing the agent's response
        """
        pass

    def calculate_token_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Calculate the total token cost for the agent's usage.
        
        :param input_tokens: Number of input tokens
        :param output_tokens: Number of output tokens
        :return: Total token cost
        """
        total_tokens = input_tokens + output_tokens
        return total_tokens * self.price_per_token
