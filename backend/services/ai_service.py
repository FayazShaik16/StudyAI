import os
import json
from dotenv import load_dotenv
from groq import Groq
from utils.response import error_response

# Force load environment variables before class initialization
load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('GROQ_API_KEY')
        self.model = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
        self.max_retries = int(os.environ.get('AI_MAX_RETRIES', '2'))
        
        if not self.api_key:
            print("WARNING: GROQ_API_KEY is not set.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)

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
                retries += 1
                if retries > self.max_retries:
                    raise RuntimeError(f"AI Generation failed after {self.max_retries} retries: {str(e)}")

ai_service = AIService()
