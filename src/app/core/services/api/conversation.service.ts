import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '@core/interfaces/api/api-response.interface';
import {
  Conversation,
  Message,
  CreateConversationDto,
  CreateMessageDto,
} from '@core/interfaces/api/conversation.interface';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly apiUrl = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  // Obtener conversaciones del usuario
  getMyConversations(): Observable<ApiResponse<Conversation[]>> {
    return this.http.get<ApiResponse<Conversation[]>>(`${this.apiUrl}`);
  }

  // Obtener una conversación por ID
  getConversationById(conversationId: number): Observable<ApiResponse<Conversation>> {
    return this.http.get<ApiResponse<Conversation>>(`${this.apiUrl}/${conversationId}`);
  }

  // Crear o obtener conversación
  findOrCreateConversation(
    data: CreateConversationDto
  ): Observable<ApiResponse<Conversation>> {
    return this.http.post<ApiResponse<Conversation>>(
      `${this.apiUrl}/find-or-create`,
      data
    );
  }

  // Crear o obtener conversación directa con otro usuario
  findOrCreateDirect(otherUserId: number): Observable<ApiResponse<Conversation>> {
    return this.http.post<ApiResponse<Conversation>>(
      `${this.apiUrl}/direct`,
      { userId: otherUserId }
    );
  }

  // Obtener conversación por ID de aplicación
  getConversationByApplication(applicationId: number): Observable<ApiResponse<Conversation>> {
    return this.http.get<ApiResponse<Conversation>>(
      `${this.apiUrl}/application/${applicationId}`
    );
  }

  // Obtener mensajes de una conversación
  getMessages(conversationId: number): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(
      `${this.apiUrl}/${conversationId}/messages`
    );
  }

  // Enviar mensaje
  sendMessage(data: CreateMessageDto): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(
      `${this.apiUrl}/${data.conversationId}/messages`,
      data
    );
  }

  // Marcar mensajes como leídos
  markAsRead(conversationId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.apiUrl}/${conversationId}/read`,
      {}
    );
  }

  // Eliminar una conversación
  deleteConversation(conversationId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${conversationId}`
    );
  }
}
