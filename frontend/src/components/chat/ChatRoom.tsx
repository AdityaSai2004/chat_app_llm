"use client";

import { useState, useRef, useEffect } from "react";
import Logo from "../Logo";
import { useParams, useRouter } from "next/navigation";
import roomService, { Room } from "@/services/room";
import messageService, { Message as ApiMessage } from "@/services/message";
import authService from "@/services/auth";

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    type: "user" | "ai";
    avatar?: string;
  };
  timestamp: Date;
  isCommand?: boolean;
}

export interface OnlineMember {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
}

export interface ChatRoomData {
  id: string;
  name: string;
  description: string;
  members: OnlineMember[];
}

interface ChatRoomProps {
  roomData?: ChatRoomData; // Optional now as we fetch it
  onLeaveRoom?: () => void;
  onOpenSettings?: () => void;
}

export default function ChatRoom({
  onLeaveRoom,
  onOpenSettings,
}: ChatRoomProps) {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [roomData, setRoomData] = useState<ChatRoomData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const user = await authService.getCurrentUser();
      if (user.success && user.data) {
        setCurrentUser(user.data.user);
      }

      if (roomCode) {
        fetchRoomDetails();
        fetchMessages();
        connectWebSocket();
      }
    };
    init();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomCode]);

  const fetchRoomDetails = async () => {
    const response = await roomService.getRoom(roomCode);
    if (response.success && response.data) {
      const apiRoom = response.data;
      setRoomData({
        id: apiRoom.room_id.toString(),
        name: apiRoom.room_name,
        description: `Room Code: ${apiRoom.room_code}`,
        members: apiRoom.users.map(u => ({
          id: u.user_id.toString(),
          name: `User ${u.user_id}`, // We need to fetch user details to get names, for now placeholder
          status: "online"
        }))
      });
    }
  };

  const fetchMessages = async () => {
    const response = await messageService.getMessages(roomCode);
    if (response.success && response.data) {
      const mappedMessages: ChatMessage[] = response.data.messages.map(msg => ({
        id: msg.message_id.toString(),
        content: msg.content,
        sender: {
          id: msg.user_id.toString(),
          name: msg.message_type === 'bot' ? 'AI Assistant' : `User ${msg.user_id}`,
          type: msg.message_type === 'bot' ? 'ai' : 'user'
        },
        timestamp: new Date(msg.sent_at),
        isCommand: msg.message_type === 'command'
      }));
      setMessages(mappedMessages);
    }
  };

  const connectWebSocket = () => {
    const token = authService.getToken();
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/room/${roomCode}?token=${token}`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);

      if (data.msg) return; // Welcome message

      // Handle incoming message
      if (data.message) {
        // If it's a bot message chunk (delta)
        if (data.type === 'bot_message_delta') {
          // We need to handle streaming updates. 
          // For simplicity, let's just append to the last message if it's from bot and matches ID
          // OR, we can just wait for the full message if we don't want to implement complex streaming UI right now.
          // However, the backend broadcasts chunks.

          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.sender.type === 'ai' && lastMsg.id === `stream-${data.message_id}`) {
              // Update existing streaming message
              return prev.map(m => m.id === lastMsg.id ? { ...m, content: m.content + data.content } : m);
            } else {
              // Start new streaming message
              return [...prev, {
                id: `stream-${data.message_id}`,
                content: data.content,
                sender: { id: 'ai', name: 'AI Assistant', type: 'ai' },
                timestamp: new Date(),
                isCommand: false
              }];
            }
          });
        } else if (data.type === 'bot_message_start') {
          setIsTyping(true);
        } else if (data.type === 'bot_message_end') {
          setIsTyping(false);
          // Ideally replace the streaming message with the final one from DB or just leave it
        } else {
          // Standard message (user or full bot message)
          // Avoid duplicating if we already have it (e.g. from optimistic update or fetch)
          // But for now, let's just append if it's not from us (or if we don't do optimistic updates)

          // If it's a user message, we might have sent it via API. 
          // The API returns the message, so we might have added it then.
          // Let's check if we already have this message ID.

          // Actually, the backend broadcasts user messages too.
          // We should filter out messages we just sent if we added them optimistically.
          // But we didn't implement optimistic updates yet.

          // Wait, the backend broadcast format for user message is:
          // { "room": ..., "message": ..., "sender_id": ..., "timestamp": ..., "message_type": ... }

          if (data.sender_id) {
            const newMsg: ChatMessage = {
              id: Date.now().toString(), // Use a temp ID or if backend sends ID use that
              content: data.message,
              sender: {
                id: data.sender_id.toString(),
                name: data.message_type === 'bot' ? 'AI Assistant' : `User ${data.sender_id}`,
                type: data.message_type === 'bot' ? 'ai' : 'user'
              },
              timestamp: new Date(data.timestamp || Date.now()),
              isCommand: data.message_type === 'command'
            };

            setMessages(prev => {
              // Avoid duplicates if possible, but without ID it's hard.
              // Let's assume we don't add it optimistically.
              return [...prev, newMsg];
            });
          }
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect logic could go here
    };

    wsRef.current = ws;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await messageService.sendMessage(roomCode, newMessage);
      if (response.success && response.data) {
        // We can add the message immediately or wait for WebSocket
        // If we wait for WebSocket, it might feel slow.
        // Let's add it immediately but mark it as sending?
        // For now, let's rely on WebSocket to avoid duplicates since we broadcast it.
        // BUT, if we rely on WebSocket, we need to make sure we don't double add.
        // The current WebSocket implementation broadcasts to ALL clients in the room, including sender.

        // So if we add it here AND receive it via WS, we get double.
        // Let's NOT add it here, and just clear input.
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAvatarContent = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!roomData) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading room...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-900 relative">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {roomData.name}
                </h1>
                <p className="text-sm text-slate-400">{roomData.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile info button */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                aria-label="Toggle room info"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.sender.type === "user" && message.sender.id === currentUser?.id?.toString() ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`flex space-x-3 max-w-2xl ${message.sender.type === "user" && message.sender.id === currentUser?.id?.toString()
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender.type === "ai"
                      ? "bg-gradient-to-br from-green-500 to-blue-600"
                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                    }`}
                >
                  <span className="text-white font-semibold text-sm">
                    {message.sender.type === "ai"
                      ? "🤖"
                      : getAvatarContent(message.sender.name)}
                  </span>
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col ${message.sender.type === "user" && message.sender.id === currentUser?.id?.toString() ? "items-end" : "items-start"
                    }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-slate-300">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${message.sender.type === "user" && message.sender.id === currentUser?.id?.toString()
                        ? "bg-blue-600 text-white"
                        : message.isCommand
                          ? "bg-slate-700 text-slate-200 border border-slate-600"
                          : "bg-slate-700 text-slate-200"
                      }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-xs">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">🤖</span>
                </div>
                <div className="bg-slate-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Room Info */}
      <div
        className={`${showSidebar ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 fixed lg:relative right-0 top-0 w-80 h-full bg-slate-800 border-l border-slate-700 flex flex-col transition-transform duration-200 ease-in-out z-50 lg:z-auto`}
      >
        {/* Room Info Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Room Info</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                Online Members (
                {roomData.members.filter((m) => m.status === "online").length})
              </h3>
              <div className="flex -space-x-2">
                {roomData.members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-800 flex items-center justify-center"
                  >
                    <span className="text-white font-semibold text-xs">
                      {getAvatarContent(member.name)}
                    </span>
                  </div>
                ))}
                {roomData.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center">
                    <span className="text-slate-300 font-semibold text-xs">
                      +{roomData.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">
            All Members
          </h3>
          <div className="space-y-3">
            {roomData.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getAvatarContent(member.name)}
                    </span>
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${member.status === "online"
                        ? "bg-green-500"
                        : member.status === "away"
                          ? "bg-yellow-500"
                          : "bg-slate-500"
                      }`}
                  ></div>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {member.name}
                  </p>
                  <p className="text-slate-400 text-xs capitalize">
                    {member.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
