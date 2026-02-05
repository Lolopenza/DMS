#!/usr/bin/env python3
"""
Quick script to check if OpenRouter API key is valid
"""
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("OPENROUTER_API_KEY", "")

if not api_key:
    print("❌ ERROR: OPENROUTER_API_KEY is not set in .env file")
    print("\nTo fix:")
    print("1. Open .env file in the project root")
    print("2. Add: OPENROUTER_API_KEY=sk-or-v1-your-key-here")
    print("3. Get your key from: https://openrouter.ai/keys")
    exit(1)

print(f"✓ API Key found: {api_key[:10]}...{api_key[-4:]}")
print("\nTesting API key...")

try:
    from openai import OpenAI
    
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )
    
    # Use free model for testing
    model = os.environ.get("OPENROUTER_MODEL", "google/gemma-3-12b-it:free")
    print(f"Testing with model: {model} (FREE, supports images)")
    
    # Simple test request
    completion = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Say 'OK' if you can read this."}],
        extra_headers={
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Discrete Math Calculator",
        }
    )
    
    reply = completion.choices[0].message.content.strip()
    print(f"✓ API Key is VALID!")
    print(f"✓ Test response: {reply}")
    print("\n✅ Your AI chatbot should work now!")
    
except Exception as e:
    error_msg = str(e)
    print(f"\n❌ API Key test FAILED")
    print(f"Error: {error_msg}")
    
    if '401' in error_msg or 'User not found' in error_msg:
        print("\n🔧 Fix:")
        print("1. Go to https://openrouter.ai/keys")
        print("2. Create a new API key or check if your key is active")
        print("3. Update .env file with the new key")
        print("4. Restart the Flask server")
    elif '402' in error_msg or 'insufficient' in error_msg.lower():
        print("\n🔧 Fix:")
        print("1. Go to https://openrouter.ai/credits")
        print("2. Add credits to your account")
    else:
        print("\n🔧 Check:")
        print("1. Your internet connection")
        print("2. OpenRouter service status")
        print("3. API key format (should start with 'sk-or-v1-')")
