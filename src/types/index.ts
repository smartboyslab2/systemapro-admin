export type BusinessStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'stripe' | 'paypal' | 'cash' | 'transfer';
export type DocumentCategory = 'contract' | 'invoice' | 'receipt' | 'logo' | 'general';
export type ClientStatus = 'active' | 'inactive' | 'overdue';
export type ActivityAction = 'payment_received' | 'status_changed' | 'document_uploaded' | 'note_added' | 'business_created' | 'business_updated';

export interface Business {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl: string;
  email: string;
  phone: string;
  monthlyAmount: number;
  status: BusinessStatus;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface Client {
  id: string;
  businessId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  monthlyRent: number;
  status: ClientStatus;
  licenseCount: number;
  address: string;
  rnc: string;
  notes: string;
  lastPaymentDate: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  businessId: string;
  clientId?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId: string | null;
  paypalOrderId: string | null;
  status: PaymentStatus;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  receiptUrl: string | null;
  notes: string;
  createdAt: string;
}

export interface Document {
  id: string;
  businessId: string;
  name: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  businessId: string;
  action: ActivityAction;
  details: {
    description: string;
    oldValue?: string;
    newValue?: string;
    metadata?: Record<string, unknown>;
  };
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'super_admin';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'payment' | 'alert' | 'info';
}

export type Theme = 'dark' | 'light';
export type ViewMode = 'table' | 'card';

export interface BusinessFilters {
  status: BusinessStatus | 'all';
  search: string;
}

export interface PaymentFilters {
  status: PaymentStatus | 'all';
  method: PaymentMethod | 'all';
  search: string;
  dateRange: { from: string; to: string } | null;
}

export interface DocumentFilters {
  category: DocumentCategory | 'all';
  search: string;
}
