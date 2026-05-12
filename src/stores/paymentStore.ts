import { create } from 'zustand';
import type { Payment, PaymentFilters } from '@/types';
import * as api from '@/lib/mockApi';

interface PaymentState {
  payments: Payment[];
  filters: PaymentFilters;
  isLoading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
  createPayment: (data: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  getPaymentsByBusiness: (businessId: string) => Payment[];
  setFilters: (filters: Partial<PaymentFilters>) => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  filters: { status: 'all', method: 'all', search: '', dateRange: null },
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const payments = await api.getPayments();
      set({ payments, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar pagos', isLoading: false });
    }
  },

  createPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newPayment = await api.createPayment(data);
      set(state => ({ payments: [newPayment, ...state.payments], isLoading: false }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear pago', isLoading: false });
    }
  },

  getPaymentsByBusiness: (businessId: string) => {
    return get().payments.filter(p => p.businessId === businessId);
  },

  setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),
}));
