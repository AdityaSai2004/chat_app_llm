'use client';

import { Room } from './Dashboard';
import RoomCard from './RoomCard';

interface RoomsGridProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
}

export default function RoomsGrid({ rooms, onJoinRoom }: RoomsGridProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
        <p className="text-slate-400 mb-6">Create your first room to start chatting!</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Create Room
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onJoinRoom={onJoinRoom}
        />
      ))}
    </div>
  );
}