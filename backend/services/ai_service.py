import os
import json
from dotenv import load_dotenv
from groq import Groq
from utils.response import error_response

import re

# Force load environment variables before class initialization
load_dotenv()

class AIService:
    def __init__(self):
        api_key_str = os.environ.get('GROQ_API_KEY', '')
        self.api_keys = [k.strip() for k in api_key_str.split(',') if k.strip()]
        self.current_key_index = 0
        
        self.model = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
        self.max_retries = int(os.environ.get('AI_MAX_RETRIES', '2'))
        
        if not self.api_keys:
            print("WARNING: GROQ_API_KEY is not set.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_keys[self.current_key_index])

    def generate_completion(self, system_prompt, user_prompt, max_tokens=2048, temperature=0.7):
        if not self.client:
            raise ValueError("Groq AI is not configured. Missing API Key.")
            
        if len(user_prompt) > 20000:
            user_prompt = user_prompt[:20000]
            
        retries = 0
        while retries <= self.max_retries:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=min(max_tokens, 4096),
                    temperature=temperature,
                    timeout=30.0
                )
                
                content = response.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from AI")
                    
                return content
                
            except Exception as e:
                error_msg = str(e)
                is_rate_limit = "Rate limit" in error_msg or type(e).__name__ == 'RateLimitError'
                
                if is_rate_limit:
                    if self.current_key_index < len(self.api_keys) - 1:
                        print(f"Key {self.current_key_index} rate limited. Rotating to key {self.current_key_index + 1}...")
                        self.current_key_index += 1
                        self.client = Groq(api_key=self.api_keys[self.current_key_index])
                        continue
                        
                    wait_time = "a few minutes"
                    match = re.search(r"Please try again in ([0-9a-zA-Z\.]+)", error_msg)
                    if match:
                        wait_time = match.group(1)
                    raise RuntimeError(f"Internal error: AI service is currently at capacity. Please try again in {wait_time}.")
                
                retries += 1
                if retries > self.max_retries:
                    raise RuntimeError(f"Internal error: AI Generation failed.")

ai_service = AIService()
