// features/ratings/models/rating.model.ts
export interface Rating {
    idValoracion: number;
    idTarea: number;
    idValorador: number;      // Quien valora
    idValorado: number;       // Quien recibe la valoración
    puntuacion: number;       // 1-5
    comentario: string;
    fechaValoracion: Date;
    tipoValoracion: 'EMPRESA_A_FREELANCER' | 'FREELANCER_A_EMPRESA';
    tarea?: {
        titulo: string;
    };
    valorador?: {
        nombre: string;
    };
    valorado?: {
        nombre: string;
    };
}

export interface RatingStats {
    averageRating: number;
    totalRatings: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

export interface CreateRatingRequest {
    idTarea: number;
    idValorado: number;
    puntuacion: number;
    comentario: string;
    tipoValoracion: 'EMPRESA_A_FREELANCER' | 'FREELANCER_A_EMPRESA';
}