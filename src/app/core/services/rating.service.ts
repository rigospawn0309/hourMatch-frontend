// features/ratings/services/rating.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rating, RatingStats, CreateRatingRequest } from '../models/rating.model';

@Injectable({
    providedIn: 'root'
})
export class RatingService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/gestion`;

    // Crear valoración
    createRating(rating: CreateRatingRequest): Observable<Rating> {
        return this.http.post<Rating>(`${this.API_URL}/valoraciones`, rating);
    }

    // Obtener valoraciones de un usuario
    getUserRatings(userId: number): Observable<Rating[]> {
        return this.http.get<Rating[]>(`${this.API_URL}/valoraciones/usuario/${userId}`);
    }

    // Obtener valoraciones de una tarea específica
    getTaskRatings(taskId: number): Observable<Rating[]> {
        return this.http.get<Rating[]>(`${this.API_URL}/valoraciones/tarea/${taskId}`);
    }

    // Obtener estadísticas de valoraciones de un usuario
    getUserRatingStats(userId: number): Observable<RatingStats> {
        return this.http.get<RatingStats>(`${this.API_URL}/valoraciones/media/${userId}`);
    }

    // Verificar si ya se puede valorar una tarea (completada y no valorada)
    canRateTask(taskId: number): Observable<{ canRate: boolean; message?: string }> {
        return this.http.get<{ canRate: boolean; message?: string }>(
            `${this.API_URL}/valoraciones/tarea/${taskId}/can-rate`
        );
    }
}