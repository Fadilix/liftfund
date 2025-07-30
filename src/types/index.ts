export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'admin' | 'user';
  };
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

export interface UserWithMedia {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  registrationMedia: {
    id: number;
    media: {
      id: number;
      url: string;
      type: string;
    };
  }[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonations: number;
  totalAmount: number;
}
