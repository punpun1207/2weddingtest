export interface WishItem {
  id: string;
  name: string;
  wish: string;
  attendance: string;
  plusOne?: string;
  guestOf: string;
  createdAt: string;
  photoUrl?: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  subtitle: string;
  icon: string;
  note?: string;
}
