import { mockBusinesses, mockPayments, mockDocuments, mockActivityLogs, mockNotifications, mockUser, mockClients, mockClientPayments } from './mockData';
import type { Business, Payment, Document, ActivityLog, Notification, User, Client } from '@/types';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(200 + Math.random() * 600);

// Auth
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  await randomDelay();
  if (email === 'admin@systemapro.com' && password === 'admin123') {
    const token = 'mock_jwt_token_' + Date.now();
    localStorage.setItem('auth_token', token);
    return { user: mockUser, token };
  }
  throw new Error('Credenciales invalidas');
}

export async function logout(): Promise<void> {
  await delay(100);
  localStorage.removeItem('auth_token');
}

export async function getCurrentUser(): Promise<User | null> {
  await randomDelay();
  const token = localStorage.getItem('auth_token');
  if (token) {
    return mockUser;
  }
  return null;
}

// Businesses
export async function getBusinesses(): Promise<Business[]> {
  await randomDelay();
  return [...mockBusinesses];
}

export async function getBusinessById(id: string): Promise<Business | null> {
  await randomDelay();
  const business = mockBusinesses.find(b => b.id === id);
  return business ? { ...business } : null;
}

export async function createBusiness(data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business> {
  await randomDelay();
  const newBusiness: Business = {
    ...data,
    id: 'b' + (mockBusinesses.length + 1 + Math.floor(Math.random() * 1000)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockBusinesses.unshift(newBusiness);
  return newBusiness;
}

export async function updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
  await randomDelay();
  const index = mockBusinesses.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Negocio no encontrado');
  mockBusinesses[index] = { ...mockBusinesses[index], ...data, updatedAt: new Date().toISOString() };
  return { ...mockBusinesses[index] };
}

export async function deleteBusiness(id: string): Promise<void> {
  await randomDelay();
  const index = mockBusinesses.findIndex(b => b.id === id);
  if (index !== -1) {
    mockBusinesses.splice(index, 1);
  }
}

// Payments
export async function getPayments(): Promise<Payment[]> {
  await randomDelay();
  return [...mockPayments];
}

export async function getPaymentsByBusiness(businessId: string): Promise<Payment[]> {
  await randomDelay();
  return mockPayments.filter(p => p.businessId === businessId);
}

export async function createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
  await randomDelay();
  const newPayment: Payment = {
    ...data,
    id: 'p' + (mockPayments.length + 1 + Math.floor(Math.random() * 1000)),
    createdAt: new Date().toISOString(),
  };
  mockPayments.unshift(newPayment);
  return newPayment;
}

// Client Payments
export async function getPaymentsByClient(clientId: string): Promise<Payment[]> {
  await randomDelay();
  return mockClientPayments
    .filter(p => p.clientId === clientId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

export async function getClientPaymentsByBusiness(businessId: string): Promise<Payment[]> {
  await randomDelay();
  return mockClientPayments
    .filter(p => p.businessId === businessId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

// Clients
export async function getClients(): Promise<Client[]> {
  await randomDelay();
  return [...mockClients];
}

export async function getClientsByBusiness(businessId: string): Promise<Client[]> {
  await randomDelay();
  return mockClients.filter(c => c.businessId === businessId);
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  await randomDelay();
  const newClient: Client = {
    ...data,
    id: 'c' + (mockClients.length + 1 + Math.floor(Math.random() * 1000)),
    createdAt: new Date().toISOString(),
  };
  mockClients.unshift(newClient);
  return newClient;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  await randomDelay();
  const index = mockClients.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Cliente no encontrado');
  mockClients[index] = { ...mockClients[index], ...data };
  return { ...mockClients[index] };
}

export async function deleteClient(id: string): Promise<void> {
  await randomDelay();
  const index = mockClients.findIndex(c => c.id === id);
  if (index !== -1) mockClients.splice(index, 1);
}

// Documents
export async function getDocuments(): Promise<Document[]> {
  await randomDelay();
  return [...mockDocuments];
}

export async function getDocumentsByBusiness(businessId: string): Promise<Document[]> {
  await randomDelay();
  return mockDocuments.filter(d => d.businessId === businessId);
}

export async function uploadDocument(data: Omit<Document, 'id' | 'uploadedAt'>): Promise<Document> {
  await randomDelay();
  const newDocument: Document = {
    ...data,
    id: 'd' + (mockDocuments.length + 1 + Math.floor(Math.random() * 1000)),
    uploadedAt: new Date().toISOString(),
  };
  mockDocuments.unshift(newDocument);
  return newDocument;
}

export async function deleteDocument(id: string): Promise<void> {
  await randomDelay();
  const index = mockDocuments.findIndex(d => d.id === id);
  if (index !== -1) {
    mockDocuments.splice(index, 1);
  }
}

// Activity Logs
export async function getActivityLogs(): Promise<ActivityLog[]> {
  await randomDelay();
  return [...mockActivityLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getActivityLogsByBusiness(businessId: string): Promise<ActivityLog[]> {
  await randomDelay();
  return mockActivityLogs
    .filter(a => a.businessId === businessId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  await randomDelay();
  return [...mockNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(100);
  const notif = mockNotifications.find(n => n.id === id);
  if (notif) notif.read = true;
}

// Analytics
export interface DashboardStats {
  totalActiveBusinesses: number;
  totalMonthlyRevenue: number;
  pendingPayments: number;
  trialBusinesses: number;
  suspendedBusinesses: number;
  cancelledBusinesses: number;
  totalBusinesses: number;
  revenueGrowth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await randomDelay();
  const activeBusinesses = mockBusinesses.filter(b => b.status === 'active');
  const trialBusinesses = mockBusinesses.filter(b => b.status === 'trial');
  const suspendedBusinesses = mockBusinesses.filter(b => b.status === 'suspended');
  const cancelledBusinesses = mockBusinesses.filter(b => b.status === 'cancelled');
  
  const totalMonthlyRevenue = activeBusinesses.reduce((sum, b) => sum + b.monthlyAmount, 0);
  const pendingPayments = mockPayments.filter(p => p.status === 'pending').length;
  
  // Calculate revenue growth (compare last 30 days vs previous 30 days)
  const now = new Date('2025-05-13');
  const last30Days = mockPayments.filter(p => {
    const date = new Date(p.paymentDate);
    return p.status === 'completed' && date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) && date <= now;
  }).reduce((sum, p) => sum + p.amount, 0);
  
  const prev30Days = mockPayments.filter(p => {
    const date = new Date(p.paymentDate);
    return p.status === 'completed' && date >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) && date < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }).reduce((sum, p) => sum + p.amount, 0);
  
  const revenueGrowth = prev30Days > 0 ? ((last30Days - prev30Days) / prev30Days) * 100 : 0;

  return {
    totalActiveBusinesses: activeBusinesses.length,
    totalMonthlyRevenue,
    pendingPayments,
    trialBusinesses: trialBusinesses.length,
    suspendedBusinesses: suspendedBusinesses.length,
    cancelledBusinesses: cancelledBusinesses.length,
    totalBusinesses: mockBusinesses.length,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
  };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  await randomDelay();
  const months = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'];
  const monthKeys = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05'];
  
  return monthKeys.map((key, i) => {
    const revenue = mockPayments
      .filter(p => {
        const date = new Date(p.paymentDate);
        const monthStr = date.toISOString().slice(0, 7);
        return monthStr === key && p.status === 'completed';
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { month: months[i], revenue };
  });
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  await randomDelay();
  return [
    { name: 'Activos', value: mockBusinesses.filter(b => b.status === 'active').length, color: '#22C55E' },
    { name: 'Prueba', value: mockBusinesses.filter(b => b.status === 'trial').length, color: '#A1A1AA' },
    { name: 'Suspendidos', value: mockBusinesses.filter(b => b.status === 'suspended').length, color: '#F59E0B' },
    { name: 'Cancelados', value: mockBusinesses.filter(b => b.status === 'cancelled').length, color: '#EF4444' },
  ];
}

// Settings
export interface AppSettings {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeMode: 'test' | 'live';
  paypalClientId: string;
  paypalSecret: string;
  paypalMode: 'sandbox' | 'live';
  notifyPaymentReceived: boolean;
  notifyPaymentOverdue: boolean;
  notifyTrialExpiring: boolean;
  notifyWeeklySummary: boolean;
}

let appSettings: AppSettings = {
  stripePublishableKey: 'pk_test_...',
  stripeSecretKey: 'sk_test_...',
  stripeMode: 'test',
  paypalClientId: 'AZ...',
  paypalSecret: 'EG...',
  paypalMode: 'sandbox',
  notifyPaymentReceived: true,
  notifyPaymentOverdue: true,
  notifyTrialExpiring: true,
  notifyWeeklySummary: false,
};

export async function getSettings(): Promise<AppSettings> {
  await randomDelay();
  return { ...appSettings };
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  await randomDelay();
  appSettings = { ...appSettings, ...settings };
  return { ...appSettings };
}

// Export data
export async function exportBusinessesCSV(): Promise<string> {
  await randomDelay();
  const headers = ['ID', 'Nombre', 'Slug', 'Dominio', 'Email', 'Telefono', 'Monto Mensual', 'Estado', 'Fecha Creacion'];
  const rows = mockBusinesses.map(b => [b.id, b.name, b.slug, b.domain, b.email, b.phone, b.monthlyAmount.toString(), b.status, b.createdAt]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export async function exportPaymentsCSV(): Promise<string> {
  await randomDelay();
  const headers = ['ID', 'Negocio ID', 'Monto', 'Metodo', 'Estado', 'Fecha Pago', 'Periodo Inicio', 'Periodo Fin'];
  const rows = mockPayments.map(p => [p.id, p.businessId, p.amount.toString(), p.paymentMethod, p.status, p.paymentDate, p.periodStart, p.periodEnd]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
