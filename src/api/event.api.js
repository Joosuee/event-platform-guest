import { http } from './httpClient';

export const eventApi = {
  getById: (id) => http.get(`/events/${id}`),
  getBySlug: (slug) => http.get(`/events/slug/${slug}`),
  getHonorees: (id) => http.get(`/events/${id}/honorees`),
  getPeople: (id) => http.get(`/events/${id}/people`),
  getLocations: (id) => http.get(`/events/${id}/locations`),
  getSchedule: (id) => http.get(`/events/${id}/schedule`),
  getFeatures: (id) => http.get(`/events/${id}/features`),
  getAssets: (id, assetType) => http.get(`/events/${id}/assets`, { asset_type: assetType }),
  getCustomFields: (id) => http.get(`/events/${id}/custom-fields`),
  setCustomField: (id, field_key, field_value) =>
    http.post(`/events/${id}/custom-fields`, { field_key, field_value }),
};