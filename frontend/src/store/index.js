import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// AUTH STORE
// ============================================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ============================================
// DOGS STORE
// ============================================
export const useDogsStore = create((set, get) => ({
  dogs: [],
  selectedDog: null,
  isLoading: false,
  error: null,
  
  setDogs: (dogs) => set({ dogs }),
  addDog: (dog) => set((state) => ({ dogs: [...state.dogs, dog] })),
  updateDog: (id, updates) => set((state) => ({
    dogs: state.dogs.map((d) => d.id === id ? { ...d, ...updates } : d),
    selectedDog: state.selectedDog?.id === id ? { ...state.selectedDog, ...updates } : state.selectedDog,
  })),
  removeDog: (id) => set((state) => ({
    dogs: state.dogs.filter((d) => d.id !== id),
    selectedDog: state.selectedDog?.id === id ? null : state.selectedDog,
  })),
  selectDog: (dog) => set({ selectedDog: dog }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============================================
// MARKETPLACE STORE
// ============================================
export const useMarketplaceStore = create((set) => ({
  listings: [],
  myListings: [],
  selectedListing: null,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    location: null,
    search: '',
  },
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  
  setListings: (listings) => set({ listings }),
  setMyListings: (myListings) => set({ myListings }),
  selectListing: (listing) => set({ selectedListing: listing }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: { category: null, minPrice: null, maxPrice: null, location: null, search: '' } }),
  setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============================================
// COMMUNITY STORE
// ============================================
export const useCommunityStore = create((set) => ({
  groups: [],
  myGroups: [],
  selectedGroup: null,
  posts: [],
  isLoading: false,
  
  setGroups: (groups) => set({ groups }),
  setMyGroups: (myGroups) => set({ myGroups }),
  selectGroup: (group) => set({ selectedGroup: group }),
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============================================
// VIDEO ANALYSIS STORE
// ============================================
export const useVideoStore = create((set) => ({
  analyses: [],
  selectedAnalysis: null,
  tutorials: [],
  uploadProgress: 0,
  isUploading: false,
  isLoading: false,
  
  setAnalyses: (analyses) => set({ analyses }),
  addAnalysis: (analysis) => set((state) => ({ analyses: [analysis, ...state.analyses] })),
  updateAnalysis: (id, updates) => set((state) => ({
    analyses: state.analyses.map((a) => a.id === id ? { ...a, ...updates } : a),
    selectedAnalysis: state.selectedAnalysis?.id === id ? { ...state.selectedAnalysis, ...updates } : state.selectedAnalysis,
  })),
  selectAnalysis: (analysis) => set({ selectedAnalysis: analysis }),
  setTutorials: (tutorials) => set({ tutorials }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setUploading: (isUploading) => set({ isUploading }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============================================
// UI STORE
// ============================================
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
