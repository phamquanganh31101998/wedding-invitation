export interface RSVPData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  attendance: 'yes' | 'no' | 'maybe';
  guestCount: number;
  message?: string;
  submittedAt: string;
}

export interface WeddingDetails {
  bride: string;
  groom: string;
  weddingDate: string;
  venue: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}
