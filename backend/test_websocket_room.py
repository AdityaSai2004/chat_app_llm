import asyncio
import websockets
import json
import threading

running = True

async def test_websocket():
    room_code = input("Enter room code: ")
    token = input("Enter JWT token: ")
    uri = f"ws://localhost:8000/ws/room/{room_code}?token={token}"
    
    async with websockets.connect(uri) as websocket:
        # Receive the initial message
        response = await websocket.recv()
        try:
            data = json.loads(response)
            print(f"Received from server: {data}")
        except:
            print(f"Received: {response}")
        
        print("WebSocket connection is now open. Type 'exit' to quit.")
        while running:
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.5)
                try:
                    data = json.loads(message)
                    print(f"Received: {data}")
                except:
                    print(f"Received: {message}")
            except asyncio.TimeoutError:
                pass
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed by the server")
                break

# Run the async WebSocket function
asyncio.run(test_websocket())
