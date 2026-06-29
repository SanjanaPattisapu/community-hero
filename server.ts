import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { CivicIssue, AppNotification, Comment, TimelineStep, AIInsights, UserProfile } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 10MB limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const DB_FILE = path.join(process.cwd(), "issues_db.json");

// Default high-fidelity seed data
const SEED_ISSUES: CivicIssue[] = [
  {
    id: "issue-1",
    title: "Hazardous Deep Pothole on Market St",
    description: "A deep pothole has developed in the middle lane of Market St near 8th. It is extremely deep and is forcing cars to swerve suddenly, which is a major accident risk, especially for motorcyclists and cyclists.",
    category: "Pothole",
    latitude: 37.7785,
    longitude: -122.4156,
    address: "815 Market St, San Francisco, CA 94103",
    reportedBy: "Alex Chen",
    reportedByEmail: "alex.chen@community.org",
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "Assigned",
    severity: "Critical",
    priority: "Immediate",
    department: "Department of Public Works (DPW) - Road Maintenance",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    upvotes: 42,
    upvotedBy: ["sanjusri0711@gmail.com", "user-2@test.com", "user-3@test.com"],
    verificationCount: 18,
    notValidCount: 0,
    verifiedBy: ["user-2@test.com", "user-3@test.com", "user-4@test.com"],
    notValidBy: [],
    aiConfidence: 0.96,
    aiSummary: "AI detected a deep asphalt pavement fracture on a multi-lane arterial road. Significant depth observed, posing immediate suspension and traffic collision hazards.",
    safetyRisk: "High risk of tire burst, rim damage, or loss of control for high-speed vehicles. Motorcyclists are at high risk of severe injury.",
    comments: [
      {
        id: "c-1",
        author: "Marcus Aurelius",
        email: "marcus@rome.org",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
        text: "I almost hit this yesterday. Very glad it is reported. Fully verified!",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "c-2",
        author: "DPW Admin",
        email: "admin@dpw.sf.gov",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=DPW",
        text: "This report has been reviewed and assigned to Crew #14. Work is scheduled to begin tomorrow.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Citizen Alex Chen reported the pothole with photo verification."
      },
      {
        status: "AI Verified",
        label: "AI Diagnostics Completed",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Gemini AI confirmed category: Pothole, identified severity: Critical, and routed to DPW."
      },
      {
        status: "Community Verified",
        label: "Community Verified",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "18 citizens have verified this issue. High community visibility."
      },
      {
        status: "Assigned",
        label: "Assigned to Department",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Assigned to DPW Road Maintenance Division."
      },
      {
        status: "Work Started",
        label: "Work Started",
        date: "",
        completed: false,
        description: "Awaiting dispatch of repair vehicle."
      },
      {
        status: "Resolved",
        label: "Resolved",
        date: "",
        completed: false,
        description: "Awaiting final asphalt sealing and clean up."
      }
    ]
  },
  {
    id: "issue-2",
    title: "Massive Illegal Garbage Dumping in Mission District Alley",
    description: "Several bags of industrial waste, discarded electronic equipment, and furniture have been piled up in the alleyway. It blocks pedestrian access and has attracted rodents. Urgent clearing is needed.",
    category: "Garbage",
    latitude: 37.7652,
    longitude: -122.4218,
    address: "712 Mission St, San Francisco, CA 94103",
    reportedBy: "Sophia Patel",
    reportedByEmail: "sophia.p@community.org",
    reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Resolved",
    severity: "High",
    priority: "High",
    department: "Department of Public Health - Environmental Services",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    upvotes: 28,
    upvotedBy: ["user-5@test.com", "user-6@test.com"],
    verificationCount: 15,
    notValidCount: 1,
    verifiedBy: ["user-5@test.com", "user-6@test.com"],
    notValidBy: ["spammer@fake.com"],
    aiConfidence: 0.94,
    aiSummary: "Image shows large scale illegal waste accumulation. Bulk items detected including electronics, mattress parts, and plastics, violating municipal environmental laws.",
    safetyRisk: "Sanitation hazard, sharp rusty metals exposed, and rodent breeding ground. Fire risk due to dry cardboard and electronics.",
    comments: [
      {
        id: "c-3",
        author: "Sophia Patel",
        email: "sophia.p@community.org",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia",
        text: "This has been sitting here for a week. Hope the authorities clean it up soon.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "c-4",
        author: "DPW Crew Head",
        email: "crew3@dpw.sf.gov",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Crew3",
        text: "Clean up completed! We cleared 1.5 tons of garbage and recycled the electronic scrap.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Citizen reported illegal garbage dump with image attachment."
      },
      {
        status: "AI Verified",
        label: "AI Diagnostics Completed",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "AI classified as Garbage and estimated High severity."
      },
      {
        status: "Community Verified",
        label: "Community Verified",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "15 local residents verified report validity."
      },
      {
        status: "Assigned",
        label: "Assigned to Department",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Routed to DPW Clean-up and Recycling Crew."
      },
      {
        status: "Work Started",
        label: "Work Started",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Trucks dispatched to the Mission District site."
      },
      {
        status: "Resolved",
        label: "Resolved",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Alley cleared, swept, and power washed. Case closed."
      }
    ]
  },
  {
    id: "issue-3",
    title: "Major Water Main Pipe Leak in Hayes Valley",
    description: "Water is bubbling up rapidly from under the sidewalk paving, flooding the local curb and creating a slippery moss hazard on Hayes Street. Clean drinking water is being wasted in large quantities.",
    category: "Water Leakage",
    latitude: 37.7739,
    longitude: -122.4312,
    address: "380 Hayes St, San Francisco, CA 94102",
    reportedBy: "Sanjusri Patel",
    reportedByEmail: "sanjusri0711@gmail.com",
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "Work Started",
    severity: "High",
    priority: "High",
    department: "San Francisco Water Power Sewer (SFPUC)",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
    upvotes: 35,
    upvotedBy: ["alex.chen@community.org", "user-7@test.com"],
    verificationCount: 12,
    notValidCount: 0,
    verifiedBy: ["alex.chen@community.org"],
    notValidBy: [],
    aiConfidence: 0.91,
    aiSummary: "Water pooling and dynamic upward flow from structural pavement gap detected. Indicates pressurized subterranean pipe rupture or joint failure.",
    safetyRisk: "Slippage on sidewalks, pavement undermining (sinkhole potential), and drinking water wastage.",
    comments: [],
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Reported by Sanjusri Patel via smartphone location services."
      },
      {
        status: "AI Verified",
        label: "AI Diagnostics Completed",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "AI classified as Water Leakage with severe flow velocity."
      },
      {
        status: "Community Verified",
        label: "Community Verified",
        date: new Date(Date.now() - 18 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "12 nearby neighbors verified the water leak."
      },
      {
        status: "Assigned",
        label: "Assigned to Department",
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Dispatched to SFPUC Emergency Water Main Repair."
      },
      {
        status: "Work Started",
        label: "Work Started",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Water valve isolated. Crews excavating sidewalk to patch pipe."
      },
      {
        status: "Resolved",
        label: "Resolved",
        date: "",
        completed: false,
        description: "Awaiting final asphalt patch after main repair."
      }
    ]
  },
  {
    id: "issue-4",
    title: "Broken Streetlight on Powell St Corner",
    description: "The street light at the corner of Powell and Geary is completely dead and has been flickering for weeks. It makes the intersection very dark at night, causing security concerns and poor pedestrian visibility near the cable car turnaround.",
    category: "Broken Streetlight",
    latitude: 37.7832,
    longitude: -122.4089,
    address: "300 Powell St, San Francisco, CA 94102",
    reportedBy: "Chloe Wong",
    reportedByEmail: "chloe@wong.me",
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "AI Verified",
    severity: "Medium",
    priority: "Medium",
    department: "Public Utilities Commission - Street Lighting Bureau",
    imageUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=600",
    upvotes: 12,
    upvotedBy: [],
    verificationCount: 3,
    notValidCount: 0,
    verifiedBy: [],
    notValidBy: [],
    aiConfidence: 0.88,
    aiSummary: "Image shows an unilluminated municipal luminaire post during late evening. Inoperable lighting fixture suspected.",
    safetyRisk: "Decreased public security, high risk of muggings, and low pedestrian visibility for heavy vehicular traffic.",
    comments: [],
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Citizen reported broken streetlight."
      },
      {
        status: "AI Verified",
        label: "AI Diagnostics Completed",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "AI classified as Broken Streetlight, estimated Medium severity."
      },
      {
        status: "Community Verified",
        label: "Community Verified",
        date: "",
        completed: false,
        description: "Awaiting more community confirmations."
      },
      {
        status: "Assigned",
        label: "Assigned to Department",
        date: "",
        completed: false,
        description: "Awaiting municipal assignment."
      },
      {
        status: "Work Started",
        label: "Work Started",
        date: "",
        completed: false,
        description: "Awaiting maintenance crew."
      },
      {
        status: "Resolved",
        label: "Resolved",
        date: "",
        completed: false,
        description: "Awaiting bulb/ballast replacement."
      }
    ]
  },
  {
    id: "issue-5",
    title: "Large Fallen Tree Blocking Pedestrian Walkway",
    description: "A huge oak branch has snapped off during the recent storm and is fully blocking the pedestrian walkway and bike lane at the panhandle of Golden Gate Park. People have to walk into the street traffic to get around.",
    category: "Fallen Tree",
    latitude: 37.7699,
    longitude: -122.4468,
    address: "1600 Oak St, San Francisco, CA 94117",
    reportedBy: "Daniel Miller",
    reportedByEmail: "dan@miller.org",
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Reported",
    severity: "High",
    priority: "High",
    department: "Recreation & Parks Department - Forestry Division",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600",
    upvotes: 19,
    upvotedBy: ["sanjusri0711@gmail.com"],
    verificationCount: 4,
    notValidCount: 0,
    verifiedBy: ["sanjusri0711@gmail.com"],
    notValidBy: [],
    aiConfidence: 0.98,
    aiSummary: "Fallen tree trunk/branch blocking a municipal right-of-way. Structural branch failure from a mature broadleaf tree.",
    safetyRisk: "Pedestrians and cyclists are forced into active vehicle lanes on Oak St. Risk of severe collisions.",
    comments: [],
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
        description: "Reported with park geolocation."
      },
      {
        status: "AI Verified",
        label: "AI Diagnostics Completed",
        date: "",
        completed: false,
        description: "Pending full system validation."
      },
      {
        status: "Community Verified",
        label: "Community Verified",
        date: "",
        completed: false,
        description: "Awaiting more verifications."
      },
      {
        status: "Assigned",
        label: "Assigned to Department",
        date: "",
        completed: false,
        description: "Pending assignment to forestry crew."
      },
      {
        status: "Work Started",
        label: "Work Started",
        date: "",
        completed: false,
        description: "Pending chainsaw dispatch."
      },
      {
        status: "Resolved",
        label: "Resolved",
        date: "",
        completed: false,
        description: "Pending debris removal."
      }
    ]
  }
];

// Load issues from DB or seed
function loadIssues(): CivicIssue[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read issues file, using seeds:", error);
  }
  
  // Create initial DB file
  saveIssues(SEED_ISSUES);
  return SEED_ISSUES;
}

function saveIssues(issues: CivicIssue[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(issues, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write issues database:", error);
  }
}

// Simulated active user profile
let activeUserProfile: UserProfile = {
  name: "Sanjusri Patel",
  email: "sanjusri0711@gmail.com",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sanjusri",
  points: 120,
  level: "Volunteer",
  badges: [
    {
      id: "badge-1",
      name: "First Responder",
      description: "Reported your first hyperlocal civic concern",
      icon: "ShieldAlert",
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
    },
    {
      id: "badge-2",
      name: "Eagle Eye",
      description: "Successfully verified 10 civic concerns reported by others",
      icon: "Eye",
      unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }
  ],
  reportsCount: 1,
  verificationsCount: 10,
  resolvedCount: 0
};

// Simulated global notifications
let notifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Issue Status Updated",
    message: "Your reported water main leak at Hayes St has been marked as 'Work Started' by the SFPUC Department.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: "status_change",
    issueId: "issue-3"
  },
  {
    id: "n-2",
    title: "Upvote Milestone",
    message: "Your report about Market St Pothole has reached over 40 upvotes! It is now the top prioritized issue in your area.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: "upvote",
    issueId: "issue-1"
  }
];

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const key = process.env.GEMINI_API_KEY;
if (key && key !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({ apiKey: key });
    console.log("GoogleGenAI initialized successfully");
  } catch (e) {
    console.error("Failed to construct GoogleGenAI instance:", e);
  }
} else {
  console.log("GoogleGenAI: Running in simulated mode (no active API key in process.env)");
}

// API ENDPOINTS

// 1. Get issues
app.get("/api/issues", (req, res) => {
  const issues = loadIssues();
  res.json({ issues, user: activeUserProfile });
});

// 2. Detect duplicate issues before submitting
app.post("/api/issues/detect-duplicates", (req, res) => {
  const { latitude, longitude, category } = req.body;
  if (!latitude || !longitude || !category) {
    return res.json({ duplicates: [] });
  }

  const issues = loadIssues();
  const threshold = 0.005; // approx 500 meters delta

  const duplicates = issues.filter((issue) => {
    const latDiff = Math.abs(issue.latitude - latitude);
    const lngDiff = Math.abs(issue.longitude - longitude);
    const isClose = latDiff < threshold && lngDiff < threshold;
    const sameCategory = issue.category.toLowerCase() === category.toLowerCase();
    const notResolved = issue.status !== "Resolved";
    return isClose && sameCategory && notResolved;
  });

  res.json({ duplicates });
});

// 3. Create issue (Report)
app.post("/api/issues/create", (req, res) => {
  const {
    title,
    description,
    category,
    latitude,
    longitude,
    address,
    imageUrl,
    aiAnalysis,
  } = req.body;

  if (!title || !description || !category || !latitude || !longitude || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const issues = loadIssues();
  
  // Calculate Gemini values if not already supplied
  const calculatedConfidence = aiAnalysis?.aiConfidence || 0.90;
  const calculatedSummary = aiAnalysis?.aiSummary || "Citizen submitted. Validated via hyperlocal standard mapping coordinates.";
  const calculatedSeverity = aiAnalysis?.severity || "Medium";
  const calculatedPriority = aiAnalysis?.priority || "Medium";
  const calculatedDepartment = aiAnalysis?.department || "Department of Public Works (DPW)";
  const calculatedSafetyRisk = aiAnalysis?.safetyRisk || "Standard roadway or community pedestrian congestion risk.";

  const newIssueId = `issue-${Date.now()}`;
  const newIssue: CivicIssue = {
    id: newIssueId,
    title,
    description,
    category,
    latitude,
    longitude,
    address,
    reportedBy: activeUserProfile.name,
    reportedByEmail: activeUserProfile.email,
    reportedAt: new Date().toISOString(),
    status: "Reported",
    severity: calculatedSeverity,
    priority: calculatedPriority,
    department: calculatedDepartment,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600",
    upvotes: 1,
    upvotedBy: [activeUserProfile.email],
    verificationCount: 0,
    notValidCount: 0,
    verifiedBy: [],
    notValidBy: [],
    aiConfidence: calculatedConfidence,
    aiSummary: calculatedSummary,
    safetyRisk: calculatedSafetyRisk,
    comments: [],
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        date: new Date().toLocaleDateString(),
        completed: true,
        description: `Citizen ${activeUserProfile.name} submitted the complaint.`
      },
      {
        status: "AI Verified",
        label: "AI Diagnostics Completed",
        date: new Date().toLocaleDateString(),
        completed: true,
        description: `Gemini AI automatically verified, assessed as ${calculatedSeverity} severity, and routed to ${calculatedDepartment}.`
      },
      {
        status: "Community Verified",
        label: "Community Verified",
        date: "",
        completed: false,
        description: "Awaiting civic verification."
      },
      {
        status: "Assigned",
        label: "Assigned to Department",
        date: "",
        completed: false,
        description: "Awaiting local government crew dispatch."
      },
      {
        status: "Work Started",
        label: "Work Started",
        date: "",
        completed: false,
        description: "Pending site deployment."
      },
      {
        status: "Resolved",
        label: "Resolved",
        date: "",
        completed: false,
        description: "Pending work completion review."
      }
    ]
  };

  issues.unshift(newIssue);
  saveIssues(issues);

  // Update active profile rewards for reporting
  activeUserProfile.points += 15; // 15 points for submitting a new report
  activeUserProfile.reportsCount += 1;
  updateUserBadgeCheck();

  // Create local notification
  notifications.unshift({
    id: `n-create-${Date.now()}`,
    title: "Complaint Created",
    message: `Your complaint '${title}' has been successfully filed and is currently being routed.`,
    createdAt: new Date().toISOString(),
    read: false,
    type: "system",
    issueId: newIssueId
  });

  res.json({ success: true, issue: newIssue, user: activeUserProfile });
});

// 4. Upvote an issue
app.post("/api/issues/upvote", (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing issue ID" });

  const issues = loadIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[index];
  const userEmail = activeUserProfile.email;

  if (issue.upvotedBy.includes(userEmail)) {
    // Unlike / remove upvote
    issue.upvotedBy = issue.upvotedBy.filter((e) => e !== userEmail);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  } else {
    // Add upvote
    issue.upvotedBy.push(userEmail);
    issue.upvotes += 1;
    
    // Reward active user if they upvoted someone else's issue
    if (issue.reportedByEmail !== userEmail) {
      activeUserProfile.points += 2; // 2 points for supporting others
    }
  }

  saveIssues(issues);
  res.json({ success: true, issue, user: activeUserProfile });
});

// 5. Verify / Flag an issue
app.post("/api/issues/verify", (req, res) => {
  const { id, isPositive } = req.body;
  if (!id) return res.status(400).json({ error: "Missing issue ID" });

  const issues = loadIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[index];
  const userEmail = activeUserProfile.email;

  if (isPositive) {
    if (!issue.verifiedBy.includes(userEmail)) {
      issue.verifiedBy.push(userEmail);
      issue.verificationCount += 1;

      // Deduct from flag if present
      if (issue.notValidBy.includes(userEmail)) {
        issue.notValidBy = issue.notValidBy.filter((e) => e !== userEmail);
        issue.notValidCount = Math.max(0, issue.notValidCount - 1);
      }

      // Reward points for verification
      activeUserProfile.points += 5; // 5 points for verification
      activeUserProfile.verificationsCount += 1;
      updateUserBadgeCheck();

      // If verification threshold met, update timeline
      if (issue.verificationCount >= 3 && issue.timeline[2].completed === false) {
        issue.timeline[2].completed = true;
        issue.timeline[2].date = new Date().toLocaleDateString();
        // Also elevate status if currently at reported / AI verified
        if (issue.status === "Reported" || issue.status === "AI Verified") {
          issue.status = "Community Verified";
        }
      }
    }
  } else {
    if (!issue.notValidBy.includes(userEmail)) {
      issue.notValidBy.push(userEmail);
      issue.notValidCount += 1;

      // Deduct from verify if present
      if (issue.verifiedBy.includes(userEmail)) {
        issue.verifiedBy = issue.verifiedBy.filter((e) => e !== userEmail);
        issue.verificationCount = Math.max(0, issue.verificationCount - 1);
      }
    }
  }

  saveIssues(issues);
  res.json({ success: true, issue, user: activeUserProfile });
});

// 6. Comment on an issue
app.post("/api/issues/comment", (req, res) => {
  const { id, text } = req.body;
  if (!id || !text) return res.status(400).json({ error: "Missing issue ID or text" });

  const issues = loadIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[index];
  const newComment: Comment = {
    id: `c-${Date.now()}`,
    author: activeUserProfile.name,
    email: activeUserProfile.email,
    avatar: activeUserProfile.avatar,
    text,
    createdAt: new Date().toISOString()
  };

  issue.comments.push(newComment);
  saveIssues(issues);

  // Reward points for starting discussion
  activeUserProfile.points += 3; // 3 points for constructive comments

  res.json({ success: true, issue, user: activeUserProfile });
});

// 7. Update status (Admin endpoint)
app.post("/api/issues/update-status", (req, res) => {
  const { id, status, department } = req.body;
  if (!id || !status) return res.status(400).json({ error: "Missing parameters" });

  const issues = loadIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[index];
  issue.status = status;
  if (department) {
    issue.department = department;
  }

  // Update corresponding step in the timeline
  const stepIndex = issue.timeline.findIndex((t) => t.status === status);
  if (stepIndex !== -1) {
    // Complete all previous steps too
    for (let i = 0; i <= stepIndex; i++) {
      if (!issue.timeline[i].completed) {
        issue.timeline[i].completed = true;
        issue.timeline[i].date = new Date().toLocaleDateString();
      }
    }
  }

  // If newly marked resolved, credit points to reporter and active admin count
  if (status === "Resolved") {
    if (issue.reportedByEmail === activeUserProfile.email) {
      activeUserProfile.resolvedCount += 1;
      activeUserProfile.points += 50; // Huge 50 pt reward for your issue getting resolved!
    }
  }

  saveIssues(issues);

  // Notify the user who reported it
  notifications.unshift({
    id: `n-status-${Date.now()}`,
    title: `Issue ${status}`,
    message: `The reported issue '${issue.title}' has been successfully updated to '${status}'.`,
    createdAt: new Date().toISOString(),
    read: false,
    type: "status_change",
    issueId: id
  });

  res.json({ success: true, issue, user: activeUserProfile });
});

// Helper: Check user reward tiers and award badges
function updateUserBadgeCheck() {
  const currentPoints = activeUserProfile.points;
  
  // Update Level
  if (currentPoints > 500) {
    activeUserProfile.level = "Gold Hero";
  } else if (currentPoints > 200) {
    activeUserProfile.level = "Community Hero";
  } else if (currentPoints > 50) {
    activeUserProfile.level = "Volunteer";
  } else {
    activeUserProfile.level = "Beginner";
  }

  // Check and add badges
  const hasFirstReport = activeUserProfile.reportsCount >= 1;
  const hasTenVerifications = activeUserProfile.verificationsCount >= 10;
  const hasGoldHero = activeUserProfile.level === "Gold Hero";

  const currentBadgeIds = activeUserProfile.badges.map((b) => b.id);

  if (hasFirstReport && !currentBadgeIds.includes("badge-1")) {
    activeUserProfile.badges.push({
      id: "badge-1",
      name: "First Responder",
      description: "Reported your first hyperlocal civic concern",
      icon: "ShieldAlert",
      unlockedAt: new Date().toLocaleDateString()
    });
  }

  if (hasTenVerifications && !currentBadgeIds.includes("badge-2")) {
    activeUserProfile.badges.push({
      id: "badge-2",
      name: "Eagle Eye",
      description: "Successfully verified 10 civic concerns reported by others",
      icon: "Eye",
      unlockedAt: new Date().toLocaleDateString()
    });
  }

  if (hasGoldHero && !currentBadgeIds.includes("badge-3")) {
    activeUserProfile.badges.push({
      id: "badge-3",
      name: "City Legend",
      description: "Unlocked the top Gold tier for exceptional civic dedication",
      icon: "Crown",
      unlockedAt: new Date().toLocaleDateString()
    });
  }
}

// 8. Notifications CRUD
app.get("/api/notifications", (req, res) => {
  res.json({ notifications });
});

app.post("/api/notifications/mark-read", (req, res) => {
  const { id } = req.body;
  if (id) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  } else {
    notifications = notifications.map((n) => ({ ...n, read: true }));
  }
  res.json({ success: true, notifications });
});

// 9. AI COMPLAINT ENHANCEMENT (Gemini AI API)
app.post("/api/ai/enhance", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text for enhancement" });

  if (!ai) {
    // Key missing - provide robust mockup
    const mocked = `A severe municipal concern regarding ${text.toLowerCase()} has been documented at this location. Immediate civil attention and department mobilization is requested to mitigate local public hazards and restore local transit sanitation standards.`;
    return res.json({ enhancedText: mocked, simulated: true });
  }

  try {
    const prompt = `Rewrite this complaint professionally for submission to city authorities. Make it sound formal, descriptive, and urgent but objective. Avoid slang and focus on municipal impact. Keep it under 120 words. Return ONLY the rewritten text without headers, prefix, or extra words.
    
Complaint: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const enhancedText = response.text?.trim() || text;
    res.json({ enhancedText, simulated: false });
  } catch (error: any) {
    console.error("Gemini AI Enhance Error:", error);
    res.status(500).json({ error: "AI Enhancement failed", details: error.message });
  }
});

// 10. AI IMAGE ANALYSIS (Gemini AI API with optional base64)
app.post("/api/ai/analyze", async (req, res) => {
  const { base64Image, fileName } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "Missing base64 image data" });
  }

  // Strip prefix if any (e.g., "data:image/jpeg;base64,")
  let cleanBase64 = base64Image;
  let mimeType = "image/jpeg";
  if (base64Image.includes(";base64,")) {
    const parts = base64Image.split(";base64,");
    mimeType = parts[0].replace("data:", "");
    cleanBase64 = parts[1];
  }

  if (!ai) {
    // Key missing fallback
    const simulatedResponse = {
      category: "Pothole",
      aiConfidence: 0.95,
      aiSummary: "The submitted photo displays a significant pavement rupture and structural sub-base deterioration on a high-traffic roadway. Immediate repair is crucial to prevent vehicle damage.",
      severity: "High",
      priority: "High",
      department: "Department of Public Works (DPW)",
      safetyRisk: "High risk of tire punctures, alignment failures, or vehicle loss of control. Severe hazard to cyclists.",
      simulated: true,
    };
    return res.json(simulatedResponse);
  }

  try {
    const prompt = `Analyze this image depicting a local civic infrastructure problem.
Determine if it is one of the following categories:
- Pothole
- Garbage
- Water Leakage
- Broken Streetlight
- Damaged Road
- Drainage Problem
- Illegal Dumping
- Fallen Tree
- Other

Output your response as a strict JSON object with these exact keys:
{
  "category": "One of the exact categories listed above",
  "aiConfidence": 0.95, // float between 0 and 1
  "aiSummary": "A concise, detailed summary of the problem shown",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "priority": "Low" | "Medium" | "High" | "Immediate",
  "department": "Name of recommended municipal department to handle this",
  "safetyRisk": "Description of direct hazards to people/cars or null"
}

Do not include any Markdown headers, \`\`\`json wrappers, or anything other than the raw JSON output.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          }
        },
        prompt
      ],
    });

    const textOutput = response.text || "";
    // Robust json extraction
    let cleanJson = textOutput.trim();
    if (cleanJson.includes("```json")) {
      cleanJson = cleanJson.split("```json")[1].split("```")[0].trim();
    } else if (cleanJson.includes("```")) {
      cleanJson = cleanJson.split("```")[1].split("```")[0].trim();
    }

    const aiData = JSON.parse(cleanJson);
    res.json({ ...aiData, simulated: false });
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    // Return graceful mockup instead of throwing 500
    res.json({
      category: "Garbage",
      aiConfidence: 0.82,
      aiSummary: "AI analyzed the upload. Debris and municipal blockages detected. Refusal of processing bypassed via local routing metrics.",
      severity: "Medium",
      priority: "Medium",
      department: "Department of Sanitation & Forestry",
      safetyRisk: "Sanitation hazard and pedestrian obstruction.",
      simulated: true,
      error: error.message
    });
  }
});

// 11. AI SYSTEM INSIGHTS (Gemini AI API)
app.get("/api/ai/insights", async (req, res) => {
  const issues = loadIssues();

  // Create simple aggregates for quick fallback/simulated insights
  const categories = issues.map((i) => i.category);
  const catCount: Record<string, number> = {};
  categories.forEach((c) => {
    catCount[c] = (catCount[c] || 0) + 1;
  });
  const catSummary = Object.entries(catCount).map(([category, count]) => ({ category, count }));

  const locations = issues.map((i) => i.address.split(",")[1]?.trim() || "Downtown");
  const locCount: Record<string, number> = {};
  locations.forEach((l) => {
    locCount[l] = (locCount[l] || 0) + 1;
  });
  const locSummary = Object.entries(locCount).map(([area, count]) => ({ area, count }));

  if (!ai) {
    const fallbackInsights: AIInsights & { simulated: boolean } = {
      mostAffectedLocations: locSummary.sort((a, b) => b.count - a.count).slice(0, 3),
      frequentlyOccurringIssues: catSummary.sort((a, b) => b.count - a.count).slice(0, 3),
      predictedFutureProblems: [
        "Increased road pavement deterioration near Market St due to coming winter moisture and high municipal bus traffic load.",
        "Potential stormwater backups in Hayes Valley sewers unless catch basin clearance schedules are accelerated prior to October rains.",
        "Increased localized garbage piling hazards in commercial transit sectors due to seasonal merchant package turnover."
      ],
      weeklyAIReport: `### 📊 Weekly Hyperlocal Performance Report
Our community has achieved a **92% resolution feedback score** this week! 

- **Total Active Inquiries**: ${issues.length} cases tracked across the grid.
- **Critical High Priority Resolving**: Roadways near Hayes Valley are seeing active SFPUC patches.
- **Community Engagement**: Leaderboards indicate massive citizen verification upswings! Keep it up!`,
      suggestions: [
        "Deploy preventative asphalt crews to inspect the Market St bus corridors before minor pavement fractures turn into major potholes.",
        "Implement warning signage nearPowell St intersection during lighting upgrade operations.",
        "Expand waste receptacle volumes along major Mission District pedestrian walkways during peak summer events."
      ],
      simulated: true
    };
    return res.json(fallbackInsights);
  }

  try {
    const prompt = `Analyze these reported community civic issues:
${JSON.stringify(issues, null, 2)}

Based on this historical data, generate a predictive analysis and recommendations for municipal planning.
Output your response as a strict JSON object with these exact keys:
{
  "mostAffectedLocations": [
    { "area": "Name of neighborhood or street", "count": 12 }
  ],
  "frequentlyOccurringIssues": [
    { "category": "Name of category", "count": 8 }
  ],
  "predictedFutureProblems": [
    "Prediction statement 1",
    "Prediction statement 2",
    "Prediction statement 3"
  ],
  "weeklyAIReport": "A detailed, beautiful markdown string report summarizing this week's progress, focus areas, and resolution trends.",
  "suggestions": [
    "Municipal suggestions 1",
    "Municipal suggestions 2",
    "Municipal suggestions 3"
  ]
}

Ensure to ONLY return the JSON output without markdown backticks or wrappers.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let cleanJson = response.text?.trim() || "";
    if (cleanJson.includes("```json")) {
      cleanJson = cleanJson.split("```json")[1].split("```")[0].trim();
    } else if (cleanJson.includes("```")) {
      cleanJson = cleanJson.split("```")[1].split("```")[0].trim();
    }

    const insightsData = JSON.parse(cleanJson);
    res.json({ ...insightsData, simulated: false });
  } catch (error: any) {
    console.error("Gemini Insights Error, falling back to simulated:", error);
    res.json({
      mostAffectedLocations: locSummary.slice(0, 3),
      frequentlyOccurringIssues: catSummary.slice(0, 3),
      predictedFutureProblems: [
        "Precipitation increases could worsen unresolved potholes.",
        "Garbage build up around recreational sectors over the weekend."
      ],
      weeklyAIReport: "### Performance Update\nIssues are being monitored and prioritized automatically via community engagement metrics.",
      suggestions: [
        "Proactively inspect public lighting systems.",
        "Increase public sanitation rounds."
      ],
      simulated: true
    });
  }
});

// 12. AI CHAT ASSISTANT (Gemini AI API)
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) return res.status(400).json({ error: "Missing user message" });

  const issues = loadIssues();

  if (!ai) {
    // Key missing conversational mockup
    let reply = "Hello! I am **HeroBot**, your Community Hero assistant. I am currently running in offline demonstration mode, but I can help guide you! \n\n";
    const lower = message.toLowerCase();

    if (lower.includes("how") && lower.includes("report")) {
      reply += "To report an issue: \n1. Navigate to the **Report Issue** section in the navigation.\n2. Provide a title, select a category (like Pothole or Water Leakage), and pin the location.\n3. Upload a photo! Gemini AI will automatically extract details, check for duplicates, and format a professional complaint. \n4. Submit to route it directly to municipal teams!";
    } else if (lower.includes("status") || lower.includes("complaint")) {
      reply += "Here is the active status of our community cases: \n";
      issues.forEach((issue) => {
        reply += `- **${issue.title}**: currently in **${issue.status}** stage (Priority: ${issue.priority}, handled by ${issue.department}).\n`;
      });
    } else if (lower.includes("department") || lower.includes("water")) {
      reply += "Water leakages are handled by the **San Francisco Water Power Sewer (SFPUC)** department. Road concerns (like potholes and damaged pavements) are routed directly to the **Department of Public Works (DPW)**.";
    } else if (lower.includes("verify") || lower.includes("points")) {
      reply += "You earn **5 reward points** for verifying or flagging issues reported by others, and **15 points** for filing unique reports! Climb the Leaderboard to become a **Community Hero** and earn badges like *Eagle Eye* and *City Legend*!";
    } else {
      reply += "I'm here to support you! You can ask me how to report complaints, inquire about current active statuses (e.g. 'status'), or learn how points and community verifications function.";
    }
    return res.json({ responseText: reply, simulated: true });
  }

  try {
    const systemPrompt = `You are HeroBot, the AI chatbot for the "Community Hero" civic platform. You help citizens report and resolve local municipal problems (potholes, garbage, water leaks).
You have real-time access to the active community complaints in Firestore:
${JSON.stringify(issues, null, 2)}

Current User Session Details:
- Name: ${activeUserProfile.name}
- Email: ${activeUserProfile.email}
- Points: ${activeUserProfile.points} pts
- Level: ${activeUserProfile.level}

Use this context to provide highly specific answers about complaints, locations, and resolving statuses.
Format responses in beautifully styled Markdown. Be polite, warm, inspiring, and concise. Keep replies under 150 words.
If they ask about complaints, look up real items in the list and summarize their status.
If they ask how to report, explain the Report form clearly.`;

    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add current interaction
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: systemPrompt },
        ...formattedHistory
      ],
    });

    res.json({ responseText: response.text, simulated: false });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.json({
      responseText: "I'm having a slight issue reaching my central core at the moment, but rest assured our community team is tracking all public works actively! You can check the dashboard to view resolution status timelines.",
      simulated: true
    });
  }
});

// Reset database endpoint
app.post("/api/admin/reset", (req, res) => {
  saveIssues(SEED_ISSUES);
  res.json({ success: true, issues: SEED_ISSUES });
});

// Configure Vite or Serve SPA static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving compiled production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
