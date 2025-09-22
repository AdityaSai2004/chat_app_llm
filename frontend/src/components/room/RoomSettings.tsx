"use client";

import { useState } from "react";
import TopNavigation from "../navigation/TopNavigation";
import ConfirmationDialog from "../common/ConfirmationDialog";
import ToastContainer, { Toast } from "../common/ToastContainer";

export interface RoomMember {
  id: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "member";
}

export interface RoomSettingsData {
  id: string;
  name: string;
  code: string;
  botEnabled: boolean;
  apiKey: string;
  members: RoomMember[];
}

interface RoomSettingsProps {
  roomData?: RoomSettingsData;
  onBack?: () => void;
  onJoinChat?: () => void;
}

// Mock data for demonstration
const mockRoomData: RoomSettingsData = {
  id: "1",
  name: "Design Critique",
  code: "XYZ-123-ABC",
  botEnabled: true,
  apiKey: "••••••••••••••",
  members: [
    { id: "1", name: "Sophia Bennett", role: "owner" },
    { id: "2", name: "Ethan Carter", role: "member" },
    { id: "3", name: "Olivia Davis", role: "member" },
  ],
};

export default function RoomSettings({
  roomData = mockRoomData,
  onBack,
  onJoinChat,
}: RoomSettingsProps) {
  const [settings, setSettings] = useState<RoomSettingsData>(roomData);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleSaveRoomInfo = () => {
    setIsEditing(false);
    // TODO: Save room information to backend
    console.log("Saving room info:", { name: settings.name });
    addToast({
      type: "success",
      title: "Room updated",
      message: "Room information has been saved successfully.",
    });
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(settings.code);
      addToast({
        type: "success",
        title: "Copied to clipboard",
        message: "Room code has been copied to your clipboard.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Copy failed",
        message: "Failed to copy room code to clipboard.",
      });
    }
  };

  const handleToggleBotStatus = () => {
    const newStatus = !settings.botEnabled;
    setSettings((prev) => ({ ...prev, botEnabled: newStatus }));
    // TODO: Update bot status on backend
    addToast({
      type: "info",
      title: "Bot status updated",
      message: `AI bot is now ${newStatus ? "active" : "inactive"}.`,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setMemberToRemove(memberId);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      const member = settings.members.find((m) => m.id === memberToRemove);
      setSettings((prev) => ({
        ...prev,
        members: prev.members.filter((member) => member.id !== memberToRemove),
      }));
      // TODO: Remove member from backend
      addToast({
        type: "success",
        title: "Member removed",
        message: `${member?.name} has been removed from the room.`,
      });
    }
    setMemberToRemove(null);
  };

  const handleDeleteRoom = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteRoom = () => {
    // TODO: Delete room on backend
    console.log("Deleting room:", settings.id);
    addToast({
      type: "success",
      title: "Room deleted",
      message: "The room has been permanently deleted.",
    });
    setShowDeleteDialog(false);
    // Navigate back after a short delay
    setTimeout(() => {
      onBack?.();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <TopNavigation
        title="Room Settings"
        onBack={onBack}
        showBackButton={true}
        actions={
          onJoinChat && (
            <button
              onClick={onJoinChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Join Chat
            </button>
          )
        }
      />

      <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        {/* Room Information Section */}
        <section className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-slate-700">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">
            Room Information
          </h2>

          <div className="space-y-4">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Room Name
              </label>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Room name"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveRoomInfo}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-white break-all">{settings.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm ml-4 flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Room Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Room Code
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm">
                  {settings.code}
                </div>
                <button
                  onClick={handleCopyRoomCode}
                  className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex-shrink-0"
                  title="Copy room code"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* AI Bot Settings Section */}
        <section className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-slate-700">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">
            AI Bot Settings
          </h2>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your API key"
              />
            </div>

            {/* Bot Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-white font-medium">Bot Status</h3>
                <p className="text-sm text-slate-400">
                  Enable or disable the AI bot for this room
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm font-medium ${
                    settings.botEnabled ? "text-green-400" : "text-slate-400"
                  }`}
                >
                  {settings.botEnabled ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={handleToggleBotStatus}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.botEnabled ? "bg-blue-600" : "bg-slate-600"
                  }`}
                  aria-label={`Toggle bot status. Currently ${
                    settings.botEnabled ? "active" : "inactive"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.botEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Members Section */}
        <section className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-slate-700">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">
            Members
          </h2>

          <div className="space-y-3">
            {settings.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs lg:text-sm">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium text-sm lg:text-base truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-slate-400 capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
                {member.role !== "owner" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="px-2 lg:px-3 py-1 text-xs lg:text-sm text-red-400 hover:text-red-300 border border-red-400 hover:border-red-300 rounded transition-colors flex-shrink-0 ml-3"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-red-600">
          <h2 className="text-lg lg:text-xl font-semibold text-red-400 mb-4 lg:mb-6">
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Delete this room</h3>
              <p className="text-sm text-slate-400 mb-4">
                Once you delete a room, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete Room
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone and all messages will be permanently lost."
        confirmText="Delete Room"
        onConfirm={confirmDeleteRoom}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={memberToRemove !== null}
        title="Remove Member"
        message={`Are you sure you want to remove ${
          settings.members.find((m) => m.id === memberToRemove)?.name
        } from this room?`}
        confirmText="Remove"
        onConfirm={confirmRemoveMember}
        onCancel={() => setMemberToRemove(null)}
        variant="warning"
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
