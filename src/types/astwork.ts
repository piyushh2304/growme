export interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string | null;
    date_start: number | null;
    date_end: number | null;
}
export interface Pagination {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
    next_url: string;
}
export interface ArtworkApiResponse {
    pagination: Pagination;
    data: Artwork[];
}