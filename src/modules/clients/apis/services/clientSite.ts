import { useApi } from "../../../../apis/base";

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_DUTY_API_BASE_URL;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createSite = async (data: any): Promise<any> => {
  // Use a longer timeout for site creation (60 seconds) to avoid timeout errors
  // while the backend processes the request (which can take 30-40 seconds)
  const response = await axios.post(`${API_BASE_URL}/client-sites`, data, {
    headers: { ...getAuthHeaders() },
    timeout: 60000, // 60 seconds timeout
  });
  return response.data;
};

export const getClientSites = async (clientId: string, page?: number, limit?: number): Promise<any> => {
  const { get } = useApi;

  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return get(`/client-sites/${clientId}${queryString}`);
};

export const getClientSitesWithCounts = async (
  clientId: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const { get } = useApi;
  return get(`/client-sites/count/${clientId}?limit=${limit}&page=${page}`);
};

export const updateSiteGeofence = async (siteId: string, data: any) => {
  const { patch } = useApi;
  return patch(`/sites/${siteId}/geofence`, data);
};
