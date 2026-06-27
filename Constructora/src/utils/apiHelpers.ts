import apiClient from '@/lib/api';

export async function safeGet<T = any>(url: string) {
  try {
    const res = await apiClient.get<T>(url);
    return { ok: true, data: res.data };
  } catch (err: any) {
    const status = err?.response?.status;
    return { ok: false, status, error: err?.response?.data || err.message || err };
  }
}