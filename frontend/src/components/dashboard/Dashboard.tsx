"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import RoomsGrid from "./RoomsGrid";
import roomService, { Room as ApiRoom } from "@/services/room";
import { useRouter } from "next/navigation";

// Adapter interface for the UI
export interface Room {
  id: string;
  name: string;
  memberCount: number;
  userRole: "Owner" | "Member";
  unreadMessages: number;
  image: string;
  code: string; // Added code for navigation
}

interface DashboardProps {
  onJoinRoom?: (roomId: string) => void;
}

export default function Dashboard({ onJoinRoom }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    const response = await roomService.getMyRooms();
    if (response.success && response.data) {
      // Transform API data to UI data
      const mappedRooms: Room[] = response.data.map((apiRoom: ApiRoom) => ({
        id: apiRoom.room_id.toString(),
        name: apiRoom.room_name,
        memberCount: apiRoom.users.length,
        userRole: "Member", // TODO: Determine role from apiRoom.users based on current user ID
        unreadMessages: 0, // TODO: Implement unread count
        image: `/room-images/tech-talk.jpg`, // Placeholder
        code: apiRoom.room_code
      }));
      setRooms(mappedRooms);
    }
    setIsLoading(false);
  };

  const handleJoinRoom = (roomCode: string) => {
    // If onJoinRoom is provided (which might expect ID), use it, but typically we navigate by code
    // The RoomsGrid likely passes the ID, but we stored code in the room object.
    // Let's assume onJoinRoom handles navigation or we do it here.
    console.log("Joining room:", roomCode);
    router.push(`/chat/${roomCode}`);
  };

  const handleCreateRoom = async () => {
    const name = prompt("Enter room name:");
    if (!name) return;
    const apiKey = prompt("Enter Gemini API Key:");
    if (!apiKey) return;

    const response = await roomService.createRoom({ name, api_key: apiKey });
    if (response.success) {
      fetchRooms();
    } else {
      alert("Failed to create room: " + response.error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Client-side filter for now
    // In a real app, we might want server-side search
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-900 relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out z-50 lg:z-auto`}
      >
        <Sidebar onCreateRoom={handleCreateRoom} />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Toggle sidebar menu"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                My Rooms
              </h1>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Join room..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-48 lg:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-white">Loading rooms...</div>
          ) : (
            <RoomsGrid rooms={filteredRooms} onJoinRoom={(id) => {
              // Find room by ID to get code
              const room = rooms.find(r => r.id === id);
              if (room) handleJoinRoom(room.code);
            }} />
          )}
        </div>
      </main>
    </div>
  );
}
