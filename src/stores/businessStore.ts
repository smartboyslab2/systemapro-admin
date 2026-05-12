import { create } from 'zustand';
import type { Business, BusinessFilters } from '@/types';
import * as api from '@/lib/mockApi';

interface BusinessState {
  businesses: Business[];
  selectedBusiness: Business | null;
  filters: BusinessFilters;
  isLoading: boolean;
  error: string | null;
  fetchBusinesses: () => Promise<void>;
  getBusinessById: (id: string) => Promise<Business | null>;
  createBusiness: (data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBusiness: (id: string, data: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  setSelectedBusiness: (business: Business | null) => void;
  setFilters: (filters: Partial<BusinessFilters>) => void;
  getFilteredBusinesses: () => Business[];
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  selectedBusiness: null,
  filters: { status: 'all', search: '' },
  isLoading: false,
  error: null,

  fetchBusinesses: async () => {
    set({ isLoading: true, error: null });
    try {
      const businesses = await api.getBusinesses();
      set({ businesses, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar negocios', isLoading: false });
    }
  },

  getBusinessById: async (id: string) => {
    const business = await api.getBusinessById(id);
    return business;
  },

  createBusiness: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newBusiness = await api.createBusiness(data);
      set(state => ({ businesses: [newBusiness, ...state.businesses], isLoading: false }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear negocio', isLoading: false });
    }
  },

  updateBusiness: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateBusiness(id, data);
      set(state => ({
        businesses: state.businesses.map(b => b.id === id ? updated : b),
        selectedBusiness: state.selectedBusiness?.id === id ? updated : state.selectedBusiness,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar negocio', isLoading: false });
    }
  },

  deleteBusiness: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteBusiness(id);
      set(state => ({
        businesses: state.businesses.filter(b => b.id !== id),
        selectedBusiness: state.selectedBusiness?.id === id ? null : state.selectedBusiness,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar negocio', isLoading: false });
    }
  },

  setSelectedBusiness: (business) => set({ selectedBusiness: business }),

  setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),

  getFilteredBusinesses: () => {
    const { businesses, filters } = get();
    return businesses.filter(b => {
      const matchesStatus = filters.status === 'all' || b.status === filters.status;
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        b.name.toLowerCase().includes(searchLower) ||
        b.domain.toLowerCase().includes(searchLower) ||
        b.email.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  },
}));
