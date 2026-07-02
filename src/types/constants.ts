import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { LucideIcon } from "lucide-react";

// Design Components interface
export type FormFieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: LucideIcon;
  registration: UseFormRegisterReturn;
  error?: FieldError;
};

export interface EventsUIState {
  isCreateFormOpen: boolean;
  openCreateForm: () => void;
  closeCreateForm: () => void;
  toggleCreateForm: () => void;
}

// File Upload
export type UploadStatus = "pending" | "uploaded" | "completed";

/** One pre-signed upload target returned by POST /api/admin/upload. */
export interface UploadUrlItem {
  content_type: string;
  expires_in: number;
  file_id: string;
  file_name: string;
  headers: Record<string, string>;
  method: string;
  upload_status: UploadStatus;
  upload_url: string;
}

/** POST /api/admin/upload — bulk pre-signed upload URLs. */
export interface BulkUploadResponse {
  items: UploadUrlItem[];
}

/** GET /api/admin/files/{file_id} — short-lived access URL for a stored file. */
export interface FileAccessResponse {
  file_url: string;
}

/** GET /api/admin/dashboard/summary */
export interface AdminDashboardSummary {
  pending_balance: number;
  today_bookings_count: number;
  today_revenue: number;
  total_revenue: number;
}

export interface SubmitContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface SubmitContactResponse {
  success?: boolean;
  message?: string;
}


export interface RequestItineraryPdfPayload {
  event_id: string;
  name: string;
  phone: string;
}

export interface RequestItineraryPdfResponse {
  download_url: string;
  success: boolean;
}