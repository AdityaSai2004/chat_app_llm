"use client";

import { useState } from "react";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "@/components/dashboard/Dashboard";
import RoomSettings from "@/components/room/RoomSettings";
import ChatRoom from "@/components/chat/ChatRoom";

type Page = "auth" | "dashboard" | "room-settings" | "chat-room";

export default function HomePage() {
  // For development, toggle between different pages
  // In production, this would be based on authentication state and routing
  const [currentPage, setCurrentPage] = useState<Page>("room-settings");

  const renderPage = () => {
    switch (currentPage) {
      case "auth":
        return <AuthPage />;
      case "dashboard":
        return (
          <Dashboard
            onJoinRoom={(roomId) => {
              console.log("Joining room:", roomId);
              setCurrentPage("chat-room");
            }}
          />
        );
      case "room-settings":
        return (
          <RoomSettings
            onBack={() => setCurrentPage("dashboard")}
            onJoinChat={() => setCurrentPage("chat-room")}
          />
        );
      case "chat-room":
        return (
          <ChatRoom
            onLeaveRoom={() => setCurrentPage("dashboard")}
            onOpenSettings={() => setCurrentPage("room-settings")}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  const getToggleButtons = () => {
    const buttons = [
      {
        page: "auth" as Page,
        label: "Auth",
        color: "bg-green-600 hover:bg-green-700",
      },
      {
        page: "dashboard" as Page,
        label: "Dashboard",
        color: "bg-blue-600 hover:bg-blue-700",
      },
      {
        page: "room-settings" as Page,
        label: "Room Settings",
        color: "bg-purple-600 hover:bg-purple-700",
      },
      {
        page: "chat-room" as Page,
        label: "Chat Room",
        color: "bg-indigo-600 hover:bg-indigo-700",
      },
    ];

    return buttons
      .filter((button) => button.page !== currentPage)
      .map((button, index) => (
        <button
          key={button.page}
          onClick={() => setCurrentPage(button.page)}
          className={`${
            button.color
          } text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors ${
            index === 0
              ? "mb-2"
              : index === 1
              ? "mb-4"
              : index === 2
              ? "mb-6"
              : "mb-8"
          }`}
        >
          {button.label}
        </button>
      ));
  };

  return (
    <div className="relative">
      {renderPage()}

      {/* Development toggle buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col-reverse space-y-reverse space-y-2 z-50">
        {getToggleButtons()}
      </div>
    </div>
  );
}
