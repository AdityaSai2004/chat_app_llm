import apiClient, { ApiResponse } from '@/lib/api';

export interface Message {
    message_id: number;
    room_code: string;
    user_id: number;
    content: string;
    message_type: string;
    sent_at: string;
}

export interface SendMessageRequest {
    content: string;
}

export interface GetMessagesResponse {
    messages: Message[];
}

class MessageService {
    async getMessages(roomCode: string): Promise<ApiResponse<GetMessagesResponse>> {
        return apiClient.get<GetMessagesResponse>(`/room/${roomCode}/messages`);
    }

    async sendMessage(roomCode: string, content: string): Promise<ApiResponse<Message>> {
        return apiClient.post<Message>(`/room/${roomCode}/send_message`, { content });
    }
}

export const messageService = new MessageService();
export default messageService;
