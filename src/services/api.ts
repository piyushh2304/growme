import type { ArtworkApiResponse } from "../types/astwork";
const BASE_URL = 'https://api.artic.edu/api/v1/artworks';

export const fetchArtworks = async (page: number): Promise<ArtworkApiResponse> => {
    const response = await fetch(`${BASE_URL}?page=${page}`);

    if (!response.ok) {
        throw new Error('Failed to fetch artworks');
    }

    return response.json();
};

export const fetchArtworksByIds = async (limit: number) => {
    const response = await fetch(`${BASE_URL}?fields=id&limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch artwork IDs');
    }

    return response.json();
};