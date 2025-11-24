
export enum Screen {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  VERIFY = 'VERIFY',
  SUCCESS = 'SUCCESS',
  DASHBOARD = 'DASHBOARD',
  PLANS = 'PLANS',
  CREATE_PLAN = 'CREATE_PLAN',
  SOCIAL = 'SOCIAL',
  PROFILE = 'PROFILE'
}

export interface Friend {
  uid: string;
  name: string;
  avatar: string;
  status?: string;
}

export interface UserData {
  uid?: string;
  email: string;
  name?: string;
  avatar?: string;
  coins?: number;
  referralCode?: string;
  referredBy?: string;
  streak?: number;
  activityStatus?: boolean; // true = visible, false = hidden
  lastCheckInDate?: string; // ISO Date string
  friends?: Friend[];
}

export interface Plan {
  id: string;
  userId: string; // Owner
  title: string;
  category: string;
  description: string;
  steps?: string[];
  createdAt?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: any; // Firestore Timestamp
  roomId: string; // 'world' or specific room ID
}
