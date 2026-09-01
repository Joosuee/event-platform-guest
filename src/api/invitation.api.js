import { http } from './httpClient';

export const invitationApi = {
  getByToken: (token) => http.get(`/invitations/${token}`),
  open: (token) => http.post(`/invitations/${token}/open`),
  respond: (token, accept) => http.post(`/invitations/${token}/respond`, { accept }),
  listGuests: (token) => http.get(`/invitations/${token}/guests`),
  addGuest: (token, full_name, is_child) =>
    http.post(`/invitations/${token}/guests`, { full_name, is_child }),
};
