import { create } from 'zustand';
import { toast } from 'react-hot-toast';

interface Beer {
  name: string;
  price: number;
  type?: string;
  alcohol_percentage?: number;
  status?: string;
}

interface FavoriteSpot {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  average_rating: number;
  beers: Beer[];
  reviews_count?: number;
}

interface FavoritesMeta {
  total: number;
  max_allowed: number;
  remaining_slots: number;
}

interface FavoritesState {
  favorites: FavoriteSpot[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastFetch: number | null;
  meta: FavoritesMeta;
  fetchFavorites: (force?: boolean) => Promise<void>;
  removeFavorite: (spotId: number) => Promise<void>;
  addFavorite: (spot: FavoriteSpot) => Promise<void>;
  toggleFavorite: (spotId: number, spotData: FavoriteSpot) => Promise<boolean>;
  isFavorite: (spotId: number) => boolean;
  canAddMore: () => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  lastFetch: null,
  meta: {
    total: 0,
    max_allowed: 3,
    remaining_slots: 3
  },

  isFavorite: (spotId: number) => {
    return get().favorites.some(fav => fav.id === spotId);
  },

  canAddMore: () => {
    const { meta } = get();
    return meta.remaining_slots > 0;
  },

  fetchFavorites: async (force = false) => {
    const state = get();
    const now = Date.now();
    
    if (state.isLoading) return;
    if (!force && 
        state.lastFetch && 
        (now - state.lastFetch < 30000) && 
        state.isInitialized) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ 
        error: 'Musisz być zalogowany', 
        isInitialized: true 
      });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch('https://piwo.jacolos.pl/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Nie udało się pobrać ulubionych miejsc');
      
      const data = await response.json();
      
      set({ 
        favorites: data.data || [], 
        meta: data.meta || {
          total: 0,
          max_allowed: 3,
          remaining_slots: 3
        },
        error: null, 
        isLoading: false,
        isInitialized: true,
        lastFetch: now
      });
    } catch (err) {
      console.error('Error in fetchFavorites:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Wystąpił błąd', 
        isLoading: false,
        isInitialized: true
      });
    }
  },

  toggleFavorite: async (spotId: number, spotData: FavoriteSpot) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Musisz być zalogowany, aby dodać do ulubionych');
      return false;
    }

    const isFavorite = get().isFavorite(spotId);
    const { meta } = get();
    
    // Jeśli próbujemy dodać nowe miejsce, sprawdź limit
    if (!isFavorite && meta.remaining_slots <= 0) {
      toast.error(
        'Osiągnięto limit 3 ulubionych miejsc. Usuń jedno z miejsc aby dodać nowe.', 
        {
          duration: 4000,
          icon: '⚠️',
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          },
        }
      );
      return false;
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/favorites/${spotId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Wystąpił błąd podczas aktualizacji ulubionych');
      }

      // Aktualizuj stan po udanej operacji na serwerze
      if (isFavorite) {
        set(state => ({
          favorites: state.favorites.filter(f => f.id !== spotId),
          meta: {
            ...state.meta,
            total: state.meta.total - 1,
            remaining_slots: state.meta.remaining_slots + 1
          }
        }));
        toast.success('Usunięto z ulubionych');
      } else {
        const beersResponse = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/beers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (beersResponse.ok) {
          const beersData = await beersResponse.json();
          spotData.beers = beersData.data || [];
        }

        set(state => ({
          favorites: [...state.favorites, spotData],
          meta: {
            ...state.meta,
            total: state.meta.total + 1,
            remaining_slots: state.meta.remaining_slots - 1
          }
        }));
        toast.success('Dodano do ulubionych');
      }

      set({ isLoading: false });
      return !isFavorite;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd');
      return false;
    }
  },

  removeFavorite: async (spotId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const spotToRemove = get().favorites.find(f => f.id === spotId);
    if (!spotToRemove) return;

    set(state => ({
      favorites: state.favorites.filter(f => f.id !== spotId),
      meta: {
        ...state.meta,
        total: state.meta.total - 1,
        remaining_slots: state.meta.remaining_slots + 1
      }
    }));

    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/favorites/${spotId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Przywróć poprzedni stan w przypadku błędu
        set(state => ({
          favorites: [...state.favorites, spotToRemove],
          meta: {
            ...state.meta,
            total: state.meta.total + 1,
            remaining_slots: state.meta.remaining_slots - 1
          }
        }));
        throw new Error('Nie udało się usunąć z ulubionych');
      }

      toast.success('Usunięto z ulubionych');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania z ulubionych');
    }
  },

  addFavorite: async (spot: FavoriteSpot) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Musisz być zalogowany, aby dodać do ulubionych');
      return;
    }

    const { meta } = get();
    if (meta.remaining_slots <= 0) {
      toast.error('Osiągnięto limit ulubionych miejsc. Usuń niektóre miejsca, aby dodać nowe.');
      return;
    }

    try {
      // Pobierz piwa przed dodaniem
      const beersResponse = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spot.id}/beers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (beersResponse.ok) {
        const beersData = await beersResponse.json();
        spot.beers = beersData.data || [];
      }

      // Dodaj do ulubionych
      const response = await fetch(`https://piwo.jacolos.pl/api/favorites/${spot.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Nie udało się dodać do ulubionych');
      }

      set(state => ({
        favorites: [...state.favorites, spot],
        meta: {
          ...state.meta,
          total: state.meta.total + 1,
          remaining_slots: state.meta.remaining_slots - 1
        }
      }));

      toast.success('Dodano do ulubionych');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania do ulubionych');
    }
  }
}));