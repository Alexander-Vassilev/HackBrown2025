import openai
import json
from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()

def lambda_handler(event, context):
    prompt = event["prompt"]
    system = event.get("system", None)
    
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),  # This is the default and can be omitted
    )
    
    messages = []
    
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
    )

    return {
        'statusCode': 200,
        'body': {"response": chat_completion.choices[0].message.content}
    }

