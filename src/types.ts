export interface Comment {
  id: string;
  author: string;
  email: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface TimelineStep {
  status: 'Reported' | 'AI Verified' | 'Community Verified' | 'Assigned' | 'Work Started' | 'Resolved';
  label: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: 'Pothole' | 'Garbage' | 'Water Leakage' | 'Broken Streetlight' | 'Damaged Road' | 'Drainage Problem' | 'Illegal Dumping' | 'Fallen Tree' | 'Other';
  latitude: number;
  longitude: number;
  address: string;
  reportedBy: string;
  reportedByEmail: string;
  reportedAt: string;
  status: 'Reported' | 'AI Verified' | 'Community Verified' | 'Assigned' | 'Work Started' | 'Resolved';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Immediate';
  department: string;
  imageUrl: string | null;
  upvotes: number;
  upvotedBy: string[];
  verificationCount: number;
  notValidCount: number;
  verifiedBy: string[];
  notValidBy: string[];
  aiConfidence: number | null;
  aiSummary: string | null;
  safetyRisk: string | null;
  comments: Comment[];
  timeline: TimelineStep[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  points: number;
  level: 'Beginner' | 'Volunteer' | 'Community Hero' | 'Gold Hero';
  badges: Badge[];
  reportsCount: number;
  verificationsCount: number;
  resolvedCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'status_change' | 'verification' | 'upvote' | 'comment' | 'system';
  issueId?: string;
}

export interface AIInsights {
  mostAffectedLocations: { area: string; count: number }[];
  frequentlyOccurringIssues: { category: string; count: number }[];
  predictedFutureProblems: string[];
  weeklyAIReport: string;
  suggestions: string[];
}
