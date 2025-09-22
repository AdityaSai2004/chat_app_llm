'use client';

import { Room } from './Dashboard';

interface RoomCardProps {
  room: Room;
  onJoinRoom: (roomId: string) => void;
}

export default function RoomCard({ room, onJoinRoom }: RoomCardProps) {
  const handleJoinClick = () => {
    onJoinRoom(room.id);
  };

  // Generate a placeholder gradient based on room name
  const getGradientColors = (name: string) => {
    const colors = [
      'from-orange-400 to-pink-400',
      'from-blue-400 to-purple-500',
      'from-green-400 to-blue-500',
      'from-purple-400 to-pink-400',
      'from-yellow-400 to-orange-500',
      'from-teal-400 to-blue-500',
      'from-pink-400 to-red-500',
      'from-indigo-400 to-purple-500'
    ];
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Room Image/Placeholder */}
      <div className={`h-32 bg-gradient-to-br ${getGradientColors(room.name)} relative`}>
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Abstract decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 rounded-lg rotate-12"></div>
      </div>

      {/* Room Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{room.name}</h3>
            <p className="text-sm text-slate-400">
              {room.memberCount} members • {room.userRole}
            </p>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="flex items-center justify-between mb-4">
          {room.unreadMessages > 0 ? (
            <p className="text-sm text-blue-400 font-medium">
              {room.unreadMessages} unread message{room.unreadMessages !== 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-sm text-slate-500">No new messages</p>
          )}
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Join
        </button>
      </div>
    </div>
  );
}