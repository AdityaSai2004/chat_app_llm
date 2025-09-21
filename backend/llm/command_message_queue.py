import asyncio
from openai import OpenAI

async def process_command_messages(question: str, api_key: str):
    command_messages = question.replace("@bot", "").strip()
    # Call Gemini API with the message content
    response = await call_gemini_api(command_messages, api_key)
    # Mark message as processed (you need to add this logic)
    print(f"Processed command message {command_messages}: {response}")

    await asyncio.sleep(5)  # Poll every 5 seconds

async def call_gemini_api(prompt: str, api_key: str):
    # Create client with the provided API key
    client = OpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        stream = True
    )
    
    # Collect all chunks into a list to avoid iteration issues
    chunks = []
    for chunk in response:
        if chunk.choices[0].delta.content:
            chunks.append(chunk.choices[0].delta.content)
    
    return chunks

# To run the queue processor, use:
# asyncio.run(process_command_messages())
