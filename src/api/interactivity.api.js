import { http } from './httpClient';
import { uploadToCloudinary } from './uploadToCloudinary';

export const galleryApi = {
  listApproved: (eventId, category) =>
    http.get(`/events/${eventId}/gallery`, { moderation_status: 'approved', category }),

  // 1) pide firma -> 2) sube directo a Cloudinary -> 3) guarda el registro (JSON)
  async upload(eventId, file, { category, orientation, invitation_token, uploaded_by_name, caption }) {
    const signature = await http.post(`/events/${eventId}/gallery/sign-upload`, { category, orientation });
    const { url, publicId } = await uploadToCloudinary(file, signature);
    return http.post(`/events/${eventId}/gallery`, {
      file_url: url,
      cloudinary_public_id: publicId,
      category: signature.category,
      orientation: signature.orientation,
      invitation_token,
      uploaded_by_name,
      caption,
    });
  },
};

export const songsApi = {
  list: (eventId) => http.get(`/events/${eventId}/songs`),
  suggest: (eventId, data) => http.post(`/events/${eventId}/songs`, data),
  vote: (requestId, invitation_token) => http.post(`/songs/${requestId}/vote`, { invitation_token }),
};

export const giftsApi = {
  list: (eventId) => http.get(`/events/${eventId}/gifts`),
  reserve: (giftId, invitation_token) => http.post(`/gifts/${giftId}/reserve`, { invitation_token }),
};

export const thanksApi = {
  list: (eventId) => http.get(`/events/${eventId}/thanks`),
  create: (eventId, data) => http.post(`/events/${eventId}/thanks`, data),
};
