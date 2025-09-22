"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import RoomsGrid from "./RoomsGrid";

export interface Room {
  id: string;
  name: string;
  memberCount: number;
  userRole: "Owner" | "Member";
  unreadMessages: number;
  image: string;
}

// Mock data for now - will be replaced with API calls
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Tech Talk",
    memberCount: 5,
    userRole: "Owner",
    unreadMessages: 2,
    image: "/room-images/tech-talk.jpg",
  },
  {
    id: "2",
    name: "Book Club",
    memberCount: 10,
    userRole: "Member",
    unreadMessages: 0,
    image: "/room-images/book-club.jpg",
  },
  {
    id: "3",
    name: "Gaming Lounge",
    memberCount: 20,
    userRole: "Member",
    unreadMessages: 5,
    image: "/room-images/gaming-lounge.jpg",
  },
  {
    id: "4",
    name: "Travel Enthusiasts",
    memberCount: 8,
    userRole: "Owner",
    unreadMessages: 1,
    image: "/room-images/travel.jpg",
  },
  {
    id: "5",
    name: "Fitness Fanatics",
    memberCount: 15,
    userRole: "Member",
    unreadMessages: 3,
    image: "/room-images/fitness.jpg",
  },
];

interface DashboardProps {
  onJoinRoom?: (roomId: string) => void;
}

export default function Dashboard({ onJoinRoom }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleJoinRoom = (roomId: string) => {
    console.log("Joining room:", roomId);
    if (onJoinRoom) {
      onJoinRoom(roomId);
    } else {
      // TODO: Default join room functionality
      console.log("No onJoinRoom callback provided");
    }
  };

  const handleCreateRoom = () => {
    console.log("Creating new room");
    // TODO: Implement create room functionality
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

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
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
          <RoomsGrid rooms={rooms} onJoinRoom={handleJoinRoom} />
        </div>
      </main>
    </div>
  );
}
