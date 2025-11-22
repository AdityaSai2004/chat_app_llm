"use client";

import { useState, useEffect } from "react";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "@/components/dashboard/Dashboard";
import RoomSettings from "@/components/room/RoomSettings";
import ChatRoom from "@/components/chat/ChatRoom";
import { useAuth } from "@/contexts/AuthContext";

type Page = "auth" | "dashboard" | "room-settings" | "chat-room";

export default function HomePage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("auth");

  // Update page based on authentication status
  useEffect(() => {
    console.log('🏠 Page effect triggered:', { isLoading, isAuthenticated, currentPage });
    if (!isLoading) {
      if (isAuthenticated && currentPage === "auth") {
        console.log('🏠 User authenticated, navigating to dashboard');
        setCurrentPage("dashboard");
      } else if (!isAuthenticated && currentPage !== "auth") {
        console.log('🏠 User not authenticated, navigating to auth');
        setCurrentPage("auth");
      }
    }
  }, [isAuthenticated, isLoading, currentPage]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // If not authenticated, always show auth page
    if (!isAuthenticated) {
      return (
        <AuthPage 
          onAuthSuccess={() => setCurrentPage("dashboard")} 
        />
      );
    }

    // If authenticated, show the requested page
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard 
            onJoinRoom={(roomId) => {
              console.log('Joining room:', roomId);
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
        return (
          <Dashboard 
            onJoinRoom={(roomId) => {
              console.log('Joining room:', roomId);
              setCurrentPage("chat-room");
            }} 
          />
        );
    }
  };

  const getToggleButtons = () => {
    if (!isAuthenticated) {
      return null;
    }

    const buttons = [
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

    const availableButtons = buttons
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
              : "mb-6"
          }`}
        >
          {button.label}
        </button>
      ));

    return [
      ...availableButtons,
      <button
        key="logout"
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors mt-4"
      >
        Logout
      </button>
    ];
  };

  const toggleButtons = getToggleButtons();

  return (
    <div className="relative">
      {renderPage()}

      {/* Development toggle buttons */}
      {toggleButtons && toggleButtons.length > 0 && (
        <div className="fixed bottom-4 right-4 flex flex-col-reverse space-y-reverse space-y-2 z-50">
          {toggleButtons}
        </div>
      )}
    </div>
  );
}
