import apiClient, { ApiResponse } from '@/lib/api';

export interface RoomUser {
    user_id: number;
    role: string;
}

export interface Room {
    room_id: number;
    room_name: string;
    room_code: string;
    users: RoomUser[];
}

export interface CreateRoomRequest {
    name: string;
    api_key: string;
}

export interface CreateRoomResponse {
    room_id: number;
    room_name: string;
    room_code: string;
}

class RoomService {
    async getMyRooms(): Promise<ApiResponse<Room[]>> {
        return apiClient.get<Room[]>('/rooms/my_rooms');
    }

    async createRoom(data: CreateRoomRequest): Promise<ApiResponse<CreateRoomResponse>> {
        return apiClient.post<CreateRoomResponse>('/create_room', data);
    }

    async joinRoom(roomCode: string): Promise<ApiResponse<any>> {
        return apiClient.post(`/rooms/${roomCode}/join`);
    }

    async getRoom(roomCode: string): Promise<ApiResponse<Room>> {
        return apiClient.get<Room>(`/rooms/${roomCode}`);
    }
}

export const roomService = new RoomService();
export default roomService;
