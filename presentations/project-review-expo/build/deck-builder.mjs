// Node-oriented editable pro deck builder.
// Run this after editing SLIDES, SOURCES, and layout functions.
// The init script installs a sibling node_modules/@oai/artifact-tool package link
// and package.json with type=module for shell-run eval builders. Run with the
// Node executable from Codex workspace dependencies or the platform-appropriate
// command emitted by the init script.
// Do not use pnpm exec from the repo root or any Node binary whose module
// lookup cannot resolve the builder's sibling node_modules/@oai/artifact-tool.

const fs = await import("node:fs/promises");
const path = await import("node:path");
const { Presentation, PresentationFile } = await import("@oai/artifact-tool");

const W = 1280;
const H = 720;

const DECK_ID = "gym-project-review-expo";
const OUT_DIR = "C:\\Users\\P.KEERTHAN\\OneDrive\\Scans\\Desktop\\MERN\\presentations\\project-review-expo\\outputs";
const REF_DIR = "C:\\Users\\P.KEERTHAN\\OneDrive\\Scans\\Desktop\\MERN\\presentations\\project-review-expo\\references";
const SCRATCH_DIR = path.resolve(process.env.PPTX_SCRATCH_DIR || path.join("tmp", "slides", DECK_ID));
const PREVIEW_DIR = path.join(SCRATCH_DIR, "preview");
const VERIFICATION_DIR = path.join(SCRATCH_DIR, "verification");
const INSPECT_PATH = path.join(SCRATCH_DIR, "inspect.ndjson");
const MAX_RENDER_VERIFY_LOOPS = 3;

const INK = "#101214";
const GRAPHITE = "#30363A";
const MUTED = "#687076";
const PAPER = "#F7F4ED";
const PAPER_96 = "#F7F4EDF5";
const WHITE = "#FFFFFF";
const ACCENT = "#27C47D";
const ACCENT_DARK = "#116B49";
const GOLD = "#D7A83D";
const CORAL = "#E86F5B";
const TRANSPARENT = "#00000000";

const TITLE_FACE = "Caladea";
const BODY_FACE = "Lato";
const MONO_FACE = "Aptos Mono";

const FALLBACK_PLATE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

const SOURCES = {
  readme: "README.md",
  backend: "Backend/server.js, Backend/routes/*.js, Backend/models/*.js",
  frontend: "Frontend/src/App.js, Frontend/src/pages/*.js, Frontend/src/components/*.js",
  api: "Frontend/src/config/apiConfig.js",
  status: "IMPLEMENTATION_STATUS.md, FIXES_SUMMARY.md",
};

const SLIDES = [
  {
    "kicker": "PROJECT REVIEW + EXPO",
    "title": "MERN Gym Management System",
    "subtitle": "A full-stack fitness operations platform that combines administration, memberships, trainer workflows, payments, attendance, progress tracking, and community engagement in one application.",
    "expectedVisual": "Title slide with strong review framing, product name, and a one-line product promise.",
    "moment": "From gym operations to member engagement in one MERN platform.",
    "notes": "Use this slide to introduce the project as more than a basic CRUD app. Emphasize that it spans operational workflows, customer journeys, trainer support, and engagement features.",
    "sources": [
      "readme",
      "backend",
      "frontend"
    ]
  },
  {
    "kicker": "PROJECT OVERVIEW",
    "title": "What the system delivers",
    "subtitle": "The project is designed as a complete digital gym ecosystem for admins, trainers, and members rather than a single-purpose booking app.",
    "expectedVisual": "Three cards summarizing platform purpose, users, and value.",
    "cards": [
      [
        "Platform Goal",
        "Digitize the core workflows of a modern gym: onboarding, plan management, trainer booking, class participation, attendance, progress monitoring, and member communication."
      ],
      [
        "Primary Users",
        "Admins manage users, plans, and programs. Trainers guide members through sessions, classes, and plans. Members book services, pay, track progress, and join the community."
      ],
      [
        "Review Value",
        "The project demonstrates full-stack integration across UI routing, API architecture, MongoDB data modeling, third-party services, role-based access, and real user journeys."
      ]
    ],
    "notes": "Frame the project as a practical management platform with user-facing and admin-facing value. Mention that the implementation includes both operational and engagement modules.",
    "sources": [
      "readme",
      "backend",
      "frontend"
    ]
  },
  {
    "kicker": "PROJECT SCALE",
    "title": "Scope visible in the codebase",
    "subtitle": "The repository already shows meaningful breadth across user types, backend modules, data structures, and frontend endpoint coverage.",
    "expectedVisual": "Three metric cards showing scope indicators from the actual code.",
    "metrics": [
      [
        "3",
        "Role types built into auth and routing",
        "admin, member, trainer"
      ],
      [
        "13",
        "Backend route groups mounted in Express",
        "auth, programs, bookings, payments, attendance, media, nutrition, progress, live classes, community, workout plans, notifications, membership"
      ],
      [
        "50+",
        "Centralized frontend API endpoints",
        "Defined in apiConfig.js for consistent client-server integration"
      ]
    ],
    "notes": "Use these numbers to show reviewers that the project has meaningful functional depth. Mention that the backend also contains 11 domain models.",
    "sources": [
      "backend",
      "api"
    ]
  },
  {
    "kicker": "PROBLEM + SOLUTION",
    "title": "Why this platform matters",
    "subtitle": "Traditional gym operations are often fragmented across registers, chats, spreadsheets, and separate payment or attendance systems.",
    "expectedVisual": "Three cards explaining the problem, solution model, and impact.",
    "cards": [
      [
        "Problem",
        "Gyms need to coordinate memberships, trainers, classes, attendance, and user communication. Fragmented tools create errors, weak visibility, and poor member experience."
      ],
      [
        "Solution",
        "This MERN system brings the workflows into one architecture: React handles the experience layer, Express handles business logic, MongoDB stores operational data, and external services support payments and media."
      ],
      [
        "Outcome",
        "The result is a platform where users can move from account creation to membership, booking, attendance, progress tracking, and community participation without leaving the system."
      ]
    ],
    "notes": "Keep this business-focused. It helps non-technical reviewers understand the motivation before the technical slides.",
    "sources": [
      "readme",
      "backend",
      "frontend"
    ]
  },
  {
    "kicker": "TECH STACK",
    "title": "Technology stack and platform services",
    "subtitle": "The solution uses a classic MERN foundation and extends it with payments, media, validation, animation, and QR-based attendance support.",
    "expectedVisual": "Three stack cards for frontend, backend, and service integrations.",
    "cards": [
      [
        "Frontend Layer",
        "React 18 powers the client app with React Router for navigation, Axios for API calls, React Toastify for notifications, Framer Motion for motion, and Stripe Elements for payments."
      ],
      [
        "Backend Layer",
        "Node.js and Express manage APIs, request handling, validation, authentication, and integration logic. MongoDB with Mongoose stores structured application data."
      ],
      [
        "Connected Services",
        "Stripe is used for payment flow, Cloudinary and Multer support media upload, QRCode supports attendance, JWT secures auth, and environment variables manage deployment-specific settings."
      ]
    ],
    "notes": "Call out that the project is not limited to the basic MERN stack; it integrates several production-style concerns.",
    "sources": [
      "readme",
      "backend",
      "frontend"
    ]
  },
  {
    "kicker": "ARCHITECTURE SNAPSHOT",
    "title": "High-level system architecture",
    "subtitle": "The application follows a layered request-response model from role-based UI screens to API endpoints, database collections, and third-party integrations.",
    "expectedVisual": "Three metric cards highlighting architectural layers and deployment pieces.",
    "metrics": [
      [
        "2",
        "Primary applications",
        "React frontend and Express backend"
      ],
      [
        "4",
        "Core layers in the flow",
        "UI, API routes, database models, external services"
      ],
      [
        "1",
        "Shared platform mission",
        "Single source of truth for gym operations and member engagement"
      ]
    ],
    "notes": "Narrate the architecture as: frontend pages call centralized endpoints, routes apply auth and business rules, Mongoose models persist domain data, and services extend functionality.",
    "sources": [
      "backend",
      "frontend",
      "api"
    ]
  },
  {
    "kicker": "CORE MODULES",
    "title": "Operational features delivered",
    "subtitle": "These modules support the day-to-day gym workflows that form the core of the system.",
    "expectedVisual": "Three cards for major operational modules.",
    "cards": [
      [
        "Membership + Payments",
        "Members can browse plans, join or cancel memberships, and use Stripe-backed payment flows. Membership data is also written back to the user profile with start and end dates."
      ],
      [
        "Bookings + Attendance",
        "Members can book trainer slots, while attendance is tracked through QR code generation, check-in, and checkout flows that create session records."
      ],
      [
        "Programs + Dashboards",
        "Fitness programs and role-specific dashboards give admins, trainers, and members targeted access to the information and actions relevant to their workflow."
      ]
    ],
    "notes": "This is the place to explain what a live demo could show first: login, browse plans, pay, book, and mark attendance.",
    "sources": [
      "readme",
      "backend",
      "frontend"
    ]
  },
  {
    "kicker": "EXTENDED MODULES",
    "title": "Engagement and wellness ecosystem",
    "subtitle": "Beyond operations, the project expands into member support, coaching, and platform engagement features.",
    "expectedVisual": "Three cards for advanced feature groups.",
    "cards": [
      [
        "Nutrition + Workout Planning",
        "Nutrition plans include goals, calories, macros, meal structures, logs, and supplements. Workout plans capture exercises, sets, reps, frequency, duration, and completion progress."
      ],
      [
        "Progress + Live Classes",
        "Progress tracking records body metrics, workouts, nutrition logs, goals, and progress photos. Live classes support scheduling, participant tracking, status changes, and optional streaming links."
      ],
      [
        "Community + Notifications",
        "Community posts support media, likes, comments, and pinned content. Notifications add platform communication for reminders, milestones, booking changes, and system updates."
      ]
    ],
    "notes": "This slide helps differentiate the project from simpler management systems. It shows the platform is designed to retain and engage users, not only register them.",
    "sources": [
      "backend",
      "frontend",
      "api"
    ]
  },
  {
    "kicker": "BACKEND DESIGN",
    "title": "Backend implementation depth",
    "subtitle": "The API layer is organized into distinct modules, each backed by domain-specific Mongoose models and route-level business logic.",
    "expectedVisual": "Three metric cards summarizing backend depth.",
    "metrics": [
      [
        "11",
        "Mongoose models in the domain layer",
        "User, Booking, Attendance, Program, MembershipPlan, NutritionPlan, WorkoutPlan, ProgressTracking, LiveClass, CommunityPost, Notification"
      ],
      [
        "JWT",
        "Authentication strategy",
        "Token-based auth with protected routes and role-aware access"
      ],
      [
        "INR",
        "Payment currency setup",
        "Stripe payment intents configured in Indian Rupees"
      ]
    ],
    "notes": "When presenting, mention that server.js mounts each route module cleanly and uses middleware for JSON parsing, CORS, environment config, and MongoDB connection.",
    "sources": [
      "backend"
    ]
  },
  {
    "kicker": "FRONTEND DESIGN",
    "title": "Frontend routing and experience design",
    "subtitle": "The React application is structured around public pages, protected routes, and role-specific dashboard experiences.",
    "expectedVisual": "Three cards for experience-layer design.",
    "cards": [
      [
        "Public Experience",
        "The landing page introduces FitZone with animated hero sections, plan highlights, center selection, and a guided entry into registration or login."
      ],
      [
        "Protected Navigation",
        "ProtectedRoute checks token presence and allowed roles before rendering routes. This separates public navigation from member, trainer, and admin workflows."
      ],
      [
        "Dashboard Coverage",
        "Admin, member, and trainer dashboards are paired with dedicated feature screens such as programs, bookings, payments, membership, attendance, nutrition, progress, live classes, and community."
      ]
    ],
    "notes": "Explain that the frontend is not a single dashboard shell. It includes multiple routes, feature pages, and a centralized API config layer to reduce hardcoded URLs.",
    "sources": [
      "frontend",
      "api",
      "status"
    ]
  },
  {
    "kicker": "DATA MODEL",
    "title": "How the data layer is structured",
    "subtitle": "The MongoDB schema design captures operational records, subscription state, coaching content, and user engagement in separate but connected collections.",
    "expectedVisual": "Three cards describing major entity groups.",
    "cards": [
      [
        "User-Centered Relationships",
        "The User model stores role, trainer-member assignment, profile image, and membership details including linked plan, center, and active period dates."
      ],
      [
        "Operational Records",
        "Bookings, Attendance, MembershipPlan, Program, WorkoutPlan, NutritionPlan, and ProgressTracking represent the core day-to-day data needed to run the gym and guide members."
      ],
      [
        "Engagement Records",
        "LiveClass, CommunityPost, and Notification extend the system into communication, participation, social interaction, reminders, and long-term member retention."
      ]
    ],
    "notes": "Mention a few schema details to show depth: measurements and meal logs in progress tracking, inclusions in membership plans, comments and likes in community posts, and participants in live classes.",
    "sources": [
      "backend"
    ]
  },
  {
    "kicker": "USER JOURNEY",
    "title": "End-to-end flow through the platform",
    "subtitle": "A member can move through a complete lifecycle inside the application, from onboarding to recurring engagement.",
    "expectedVisual": "Three metric cards describing the journey stages.",
    "metrics": [
      [
        "1",
        "Onboarding entry",
        "Register or login with role-aware access"
      ],
      [
        "4+",
        "Core member journey actions",
        "Select membership, pay, book trainer, mark attendance"
      ],
      [
        "Ongoing",
        "Retention loops",
        "Track progress, follow plans, join live classes, use community, receive notifications"
      ]
    ],
    "notes": "This is a good slide for explaining the demo sequence. Walk through how the user experience continues after the first transaction instead of ending at signup.",
    "sources": [
      "frontend",
      "backend",
      "api"
    ]
  },
  {
    "kicker": "IMPLEMENTATION STATUS",
    "title": "Fixes and improvements already completed",
    "subtitle": "The project documentation shows active cleanup work that improved maintainability, correctness, and demo readiness.",
    "expectedVisual": "Three cards for completed fixes.",
    "cards": [
      [
        "Centralized API Configuration",
        "A dedicated apiConfig.js file was introduced to remove scattered localhost URLs and define a shared endpoint layer for the frontend."
      ],
      [
        "Missing Module Completion",
        "Nutrition, Progress, and Membership pages were created or completed, expanding the feature surface and reducing broken navigation gaps."
      ],
      [
        "Bug Resolution",
        "Attendance QR issues, booking endpoint issues, endpoint import problems, and admin role registration visibility were documented as fixed in the project notes."
      ]
    ],
    "notes": "This slide is especially helpful in a review because it shows engineering iteration, not just final UI. Mention that the codebase was actively stabilized for testing and presentation.",
    "sources": [
      "status"
    ]
  },
  {
    "kicker": "SECURITY + SETUP",
    "title": "Security, integrations, and environment readiness",
    "subtitle": "The project includes multiple production-style considerations that go beyond visual features.",
    "expectedVisual": "Three cards for auth, services, and environment setup.",
    "cards": [
      [
        "Authentication + Access",
        "Passwords are hashed with bcrypt, JWT tokens secure sessions, and role checks help restrict admin, trainer, and member access across screens and backend actions."
      ],
      [
        "Service Integrations",
        "Stripe handles payment intents and confirmation, Cloudinary supports media handling, QR generation supports attendance, and webhook support is prepared for payment events."
      ],
      [
        "Deployment Inputs",
        "Backend and frontend rely on environment variables for database connection, JWT secret, Stripe keys, Cloudinary credentials, frontend URL, and API base configuration."
      ]
    ],
    "notes": "Use this slide to show practical engineering maturity. It reassures reviewers that the team considered security and configuration management.",
    "sources": [
      "backend",
      "frontend",
      "readme"
    ]
  },
  {
    "kicker": "EVALUATION",
    "title": "Strengths, limitations, and next-step opportunities",
    "subtitle": "The project already shows strong breadth, while also leaving clear paths for further enhancement and production hardening.",
    "expectedVisual": "Three metric cards summarizing evaluation points.",
    "metrics": [
      [
        "Strength",
        "Wide feature breadth across operations and engagement",
        "Shows multi-module full-stack implementation rather than isolated CRUD pages"
      ],
      [
        "Current Limit",
        "Readiness depends on environment setup and seeded data",
        "MongoDB, service keys, and end-to-end testing are required for full demo flow"
      ],
      [
        "Roadmap",
        "Analytics, mobile UX, real-time updates, and deployment",
        "Natural next steps after stabilizing testing and production hosting"
      ]
    ],
    "notes": "Balance this slide carefully: highlight the strong scope while honestly noting that full production readiness would require stronger testing, deployment, and operational monitoring.",
    "sources": [
      "readme",
      "status",
      "backend",
      "frontend"
    ]
  },
  {
    "kicker": "CLOSING",
    "title": "Project conclusion and expo talking points",
    "subtitle": "This MERN project demonstrates how a fitness business can be digitized across management, coaching, payments, and community experiences in a single full-stack system.",
    "expectedVisual": "Three closing cards for summary, demo, and discussion.",
    "cards": [
      [
        "Why It Stands Out",
        "The platform combines technical integration, role-aware design, and broad functional coverage, making it a strong project for both review and public demonstration."
      ],
      [
        "Recommended Demo Flow",
        "Show registration or login, navigate to dashboards, open membership and payment flow, create a booking, display attendance QR, and finish with progress or community features."
      ],
      [
        "Discussion Starters",
        "Possible questions to address include scalability, security upgrades, production deployment, mobile support, trainer workflows, and future AI-driven personalization."
      ]
    ],
    "notes": "End with confidence. This slide should prepare you for viva questions and expo conversations after the formal walkthrough.",
    "sources": [
      "readme",
      "backend",
      "frontend",
      "status"
    ]
  }
];

const inspectRecords = [];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  if (!bytes.byteLength) {
    throw new Error(`Image file is empty: ${imagePath}`);
  }
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function normalizeImageConfig(config) {
  if (!config.path) {
    return config;
  }
  const { path: imagePath, ...rest } = config;
  return {
    ...rest,
    blob: await readImageBlob(imagePath),
  };
}

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const obsoleteFinalArtifacts = [
    "preview",
    "verification",
    "inspect.ndjson",
    ["presentation", "proto.json"].join("_"),
    ["quality", "report.json"].join("_"),
  ];
  for (const obsolete of obsoleteFinalArtifacts) {
    await fs.rm(path.join(OUT_DIR, obsolete), { recursive: true, force: true });
  }
  await fs.mkdir(SCRATCH_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
}

function lineConfig(fill = TRANSPARENT, width = 0) {
  return { style: "solid", fill, width };
}

function recordShape(slideNo, shape, role, shapeType, x, y, w, h) {
  if (!slideNo) return;
  inspectRecords.push({
    kind: "shape",
    slide: slideNo,
    id: shape?.id || `slide-${slideNo}-${role}-${inspectRecords.length + 1}`,
    role,
    shapeType,
    bbox: [x, y, w, h],
  });
}

function addShape(slide, geometry, x, y, w, h, fill = TRANSPARENT, line = TRANSPARENT, lineWidth = 0, meta = {}) {
  const shape = slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: lineConfig(line, lineWidth),
  });
  recordShape(meta.slideNo, shape, meta.role || geometry, geometry, x, y, w, h);
  return shape;
}

function normalizeText(text) {
  if (Array.isArray(text)) {
    return text.map((item) => String(item ?? "")).join("\n");
  }
  return String(text ?? "");
}

function textLineCount(text) {
  const value = normalizeText(text);
  if (!value.trim()) {
    return 0;
  }
  return Math.max(1, value.split(/\n/).length);
}

function requiredTextHeight(text, fontSize, lineHeight = 1.18, minHeight = 8) {
  const lines = textLineCount(text);
  if (lines === 0) {
    return minHeight;
  }
  return Math.max(minHeight, lines * fontSize * lineHeight);
}

function assertTextFits(text, boxHeight, fontSize, role = "text") {
  const required = requiredTextHeight(text, fontSize);
  const tolerance = Math.max(2, fontSize * 0.08);
  if (normalizeText(text).trim() && boxHeight + tolerance < required) {
    throw new Error(
      `${role} text box is too short: height=${boxHeight.toFixed(1)}, required>=${required.toFixed(1)}, ` +
        `lines=${textLineCount(text)}, fontSize=${fontSize}, text=${JSON.stringify(normalizeText(text).slice(0, 90))}`,
    );
  }
}

function wrapText(text, widthChars) {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > widthChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.join("\n");
}

function recordText(slideNo, shape, role, text, x, y, w, h) {
  const value = normalizeText(text);
  inspectRecords.push({
    kind: "textbox",
    slide: slideNo,
    id: shape?.id || `slide-${slideNo}-${role}-${inspectRecords.length + 1}`,
    role,
    text: value,
    textPreview: value.replace(/\n/g, " | ").slice(0, 180),
    textChars: value.length,
    textLines: textLineCount(value),
    bbox: [x, y, w, h],
  });
}

function recordImage(slideNo, image, role, imagePath, x, y, w, h) {
  inspectRecords.push({
    kind: "image",
    slide: slideNo,
    id: image?.id || `slide-${slideNo}-${role}-${inspectRecords.length + 1}`,
    role,
    path: imagePath,
    bbox: [x, y, w, h],
  });
}

function applyTextStyle(box, text, size, color, bold, face, align, valign, autoFit, listStyle) {
  box.text = text;
  box.text.fontSize = size;
  box.text.color = color;
  box.text.bold = Boolean(bold);
  box.text.alignment = align;
  box.text.verticalAlignment = valign;
  box.text.typeface = face;
  box.text.insets = { left: 0, right: 0, top: 0, bottom: 0 };
  if (autoFit) {
    box.text.autoFit = autoFit;
  }
  if (listStyle) {
    box.text.style = "list";
  }
}

function addText(
  slide,
  slideNo,
  text,
  x,
  y,
  w,
  h,
  {
    size = 22,
    color = INK,
    bold = false,
    face = BODY_FACE,
    align = "left",
    valign = "top",
    fill = TRANSPARENT,
    line = TRANSPARENT,
    lineWidth = 0,
    autoFit = null,
    listStyle = false,
    checkFit = true,
    role = "text",
  } = {},
) {
  if (!checkFit && textLineCount(text) > 1) {
    throw new Error("checkFit=false is only allowed for single-line headers, footers, and captions.");
  }
  if (checkFit) {
    assertTextFits(text, h, size, role);
  }
  const box = addShape(slide, "rect", x, y, w, h, fill, line, lineWidth);
  applyTextStyle(box, text, size, color, bold, face, align, valign, autoFit, listStyle);
  recordText(slideNo, box, role, text, x, y, w, h);
  return box;
}

async function addImage(slide, slideNo, config, position, role, sourcePath = null) {
  const image = slide.images.add(await normalizeImageConfig(config));
  image.position = position;
  recordImage(slideNo, image, role, sourcePath || config.path || config.uri || "inline-data-url", position.left, position.top, position.width, position.height);
  return image;
}

async function addPlate(slide, slideNo, opacityPanel = false) {
  slide.background.fill = PAPER;
  const platePath = path.join(REF_DIR, `slide-${String(slideNo).padStart(2, "0")}.png`);
  if (await pathExists(platePath)) {
    await addImage(
      slide,
      slideNo,
      { path: platePath, fit: "cover", alt: `Text-free art-direction plate for slide ${slideNo}` },
      { left: 0, top: 0, width: W, height: H },
      "art plate",
      platePath,
    );
  } else {
    await addImage(
      slide,
      slideNo,
      { dataUrl: FALLBACK_PLATE_DATA_URL, fit: "cover", alt: `Fallback blank art plate for slide ${slideNo}` },
      { left: 0, top: 0, width: W, height: H },
      "fallback art plate",
      "fallback-data-url",
    );
  }
  if (opacityPanel) {
    addShape(slide, "rect", 0, 0, W, H, "#FFFFFFB8", TRANSPARENT, 0, { slideNo, role: "plate readability overlay" });
  }
}

function addHeader(slide, slideNo, kicker, idx, total) {
  addText(slide, slideNo, String(kicker || "").toUpperCase(), 64, 34, 430, 24, {
    size: 13,
    color: ACCENT_DARK,
    bold: true,
    face: MONO_FACE,
    checkFit: false,
    role: "header",
  });
  addText(slide, slideNo, `${String(idx).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, 1114, 34, 104, 24, {
    size: 13,
    color: ACCENT_DARK,
    bold: true,
    face: MONO_FACE,
    align: "right",
    checkFit: false,
    role: "header",
  });
  addShape(slide, "rect", 64, 64, 1152, 2, INK, TRANSPARENT, 0, { slideNo, role: "header rule" });
  addShape(slide, "ellipse", 57, 57, 16, 16, ACCENT, INK, 2, { slideNo, role: "header marker" });
}

function addTitleBlock(slide, slideNo, title, subtitle = null, x = 64, y = 86, w = 780, dark = false) {
  const titleColor = dark ? PAPER : INK;
  const bodyColor = dark ? PAPER : GRAPHITE;
  addText(slide, slideNo, title, x, y, w, 142, {
    size: 40,
    color: titleColor,
    bold: true,
    face: TITLE_FACE,
    role: "title",
  });
  if (subtitle) {
    addText(slide, slideNo, subtitle, x + 2, y + 148, Math.min(w, 720), 70, {
      size: 19,
      color: bodyColor,
      face: BODY_FACE,
      role: "subtitle",
    });
  }
}

function addIconBadge(slide, slideNo, x, y, accent = ACCENT, kind = "signal") {
  addShape(slide, "ellipse", x, y, 54, 54, PAPER_96, INK, 1.2, { slideNo, role: "icon badge" });
  if (kind === "flow") {
    addShape(slide, "ellipse", x + 13, y + 18, 10, 10, accent, INK, 1, { slideNo, role: "icon glyph" });
    addShape(slide, "ellipse", x + 31, y + 27, 10, 10, accent, INK, 1, { slideNo, role: "icon glyph" });
    addShape(slide, "rect", x + 22, y + 25, 19, 3, INK, TRANSPARENT, 0, { slideNo, role: "icon glyph" });
  } else if (kind === "layers") {
    addShape(slide, "roundRect", x + 13, y + 15, 26, 13, accent, INK, 1, { slideNo, role: "icon glyph" });
    addShape(slide, "roundRect", x + 18, y + 24, 26, 13, GOLD, INK, 1, { slideNo, role: "icon glyph" });
    addShape(slide, "roundRect", x + 23, y + 33, 20, 10, CORAL, INK, 1, { slideNo, role: "icon glyph" });
  } else {
    addShape(slide, "rect", x + 16, y + 29, 6, 12, accent, TRANSPARENT, 0, { slideNo, role: "icon glyph" });
    addShape(slide, "rect", x + 25, y + 21, 6, 20, accent, TRANSPARENT, 0, { slideNo, role: "icon glyph" });
    addShape(slide, "rect", x + 34, y + 14, 6, 27, accent, TRANSPARENT, 0, { slideNo, role: "icon glyph" });
  }
}

function addCard(slide, slideNo, x, y, w, h, label, body, { accent = ACCENT, fill = PAPER_96, line = INK, iconKind = "signal" } = {}) {
  if (h < 200) {
    throw new Error(`Card is too short for editable pro-deck copy: height=${h.toFixed(1)}, minimum=200.`);
  }
  addShape(slide, "roundRect", x, y, w, h, fill, line, 1.2, { slideNo, role: `card panel: ${label}` });
  addShape(slide, "rect", x, y, 8, h, accent, TRANSPARENT, 0, { slideNo, role: `card accent: ${label}` });
  addIconBadge(slide, slideNo, x + 22, y + 24, accent, iconKind);
  addText(slide, slideNo, label, x + 88, y + 22, w - 108, 28, {
    size: 15,
    color: ACCENT_DARK,
    bold: true,
    face: MONO_FACE,
    role: "card label",
  });
  const wrapped = wrapText(body, Math.max(32, Math.floor(w / 10.5)));
  const bodyY = y + 86;
  const bodyH = h - (bodyY - y) - 22;
  if (bodyH < 54) {
    throw new Error(`Card body area is too short: height=${bodyH.toFixed(1)}, cardHeight=${h.toFixed(1)}, label=${JSON.stringify(label)}.`);
  }
  addText(slide, slideNo, wrapped, x + 24, bodyY, w - 48, bodyH, {
    size: 15,
    color: INK,
    face: BODY_FACE,
    role: `card body: ${label}`,
  });
}

function addMetricCard(slide, slideNo, x, y, w, h, metric, label, note = null, accent = ACCENT) {
  if (h < 132) {
    throw new Error(`Metric card is too short for editable pro-deck copy: height=${h.toFixed(1)}, minimum=132.`);
  }
  addShape(slide, "roundRect", x, y, w, h, PAPER_96, INK, 1.2, { slideNo, role: `metric panel: ${label}` });
  addShape(slide, "rect", x, y, w, 7, accent, TRANSPARENT, 0, { slideNo, role: `metric accent: ${label}` });
  addText(slide, slideNo, metric, x + 22, y + 24, w - 44, 54, {
    size: 34,
    color: INK,
    bold: true,
    face: TITLE_FACE,
    role: "metric value",
  });
  addText(slide, slideNo, label, x + 24, y + 82, w - 48, 38, {
    size: 16,
    color: GRAPHITE,
    face: BODY_FACE,
    role: "metric label",
  });
  if (note) {
    addText(slide, slideNo, note, x + 24, y + h - 42, w - 48, 22, {
      size: 10,
      color: MUTED,
      face: BODY_FACE,
      role: "metric note",
    });
  }
}

function addNotes(slide, body, sourceKeys) {
  const sourceLines = (sourceKeys || []).map((key) => `- ${SOURCES[key] || key}`).join("\n");
  slide.speakerNotes.setText(`${body || ""}\n\n[Sources]\n${sourceLines}`);
}

function addReferenceCaption(slide, slideNo) {
  addText(
    slide,
    slideNo,
    "All visible text, structure, and presentation content in this deck are editable PowerPoint objects.",
    64,
    674,
    980,
    22,
    {
      size: 10,
      color: MUTED,
      face: BODY_FACE,
      checkFit: false,
      role: "caption",
    },
  );
}

async function slideCover(presentation) {
  const slideNo = 1;
  const data = SLIDES[0];
  const slide = presentation.slides.add();
  await addPlate(slide, slideNo);
  addShape(slide, "rect", 0, 0, W, H, "#FFFFFFCC", TRANSPARENT, 0, { slideNo, role: "cover contrast overlay" });
  addShape(slide, "rect", 64, 86, 7, 455, ACCENT, TRANSPARENT, 0, { slideNo, role: "cover accent rule" });
  addText(slide, slideNo, data.kicker, 86, 88, 520, 26, {
    size: 13,
    color: ACCENT_DARK,
    bold: true,
    face: MONO_FACE,
    role: "kicker",
  });
  addText(slide, slideNo, data.title, 82, 130, 785, 184, {
    size: 48,
    color: INK,
    bold: true,
    face: TITLE_FACE,
    role: "cover title",
  });
  addText(slide, slideNo, data.subtitle, 86, 326, 610, 86, {
    size: 20,
    color: GRAPHITE,
    face: BODY_FACE,
    role: "cover subtitle",
  });
  addShape(slide, "roundRect", 86, 456, 390, 92, PAPER_96, INK, 1.2, { slideNo, role: "cover moment panel" });
  addText(slide, slideNo, data.moment || "Replace with core idea", 112, 478, 336, 40, {
    size: 23,
    color: INK,
    bold: true,
    face: TITLE_FACE,
    role: "cover moment",
  });
  addReferenceCaption(slide, slideNo);
  addNotes(slide, data.notes, data.sources);
}

async function slideCards(presentation, idx) {
  const data = SLIDES[idx - 1];
  const slide = presentation.slides.add();
  await addPlate(slide, idx);
  addShape(slide, "rect", 0, 0, W, H, "#FFFFFFB8", TRANSPARENT, 0, { slideNo: idx, role: "content contrast overlay" });
  addHeader(slide, idx, data.kicker, idx, SLIDES.length);
  addTitleBlock(slide, idx, data.title, data.subtitle, 64, 86, 760);
  const cards = data.cards?.length
    ? data.cards
    : [
        ["Replace", "Add a specific, sourced point for this slide."],
        ["Author", "Use native PowerPoint chart objects for charts; use deterministic geometry for cards and callouts."],
        ["Verify", "Render previews, inspect them at readable size, and fix actionable layout issues within 3 total render loops."],
      ];
  const cols = Math.min(3, cards.length);
  const cardW = (1114 - (cols - 1) * 24) / cols;
  const iconKinds = ["signal", "flow", "layers"];
  for (let cardIdx = 0; cardIdx < cols; cardIdx += 1) {
    const [label, body] = cards[cardIdx];
    const x = 84 + cardIdx * (cardW + 24);
    addCard(slide, idx, x, 380, cardW, 234, label, body, { iconKind: iconKinds[cardIdx % iconKinds.length] });
  }
  addReferenceCaption(slide, idx);
  addNotes(slide, data.notes, data.sources);
}

async function slideMetrics(presentation, idx) {
  const data = SLIDES[idx - 1];
  const slide = presentation.slides.add();
  await addPlate(slide, idx);
  addShape(slide, "rect", 0, 0, W, H, "#FFFFFFBD", TRANSPARENT, 0, { slideNo: idx, role: "metrics contrast overlay" });
  addHeader(slide, idx, data.kicker, idx, SLIDES.length);
  addTitleBlock(slide, idx, data.title, data.subtitle, 64, 86, 700);
  const metrics = data.metrics || [
    ["00", "Replace metric", "Source"],
    ["00", "Replace metric", "Source"],
    ["00", "Replace metric", "Source"],
  ];
  const accents = [ACCENT, GOLD, CORAL];
  for (let metricIdx = 0; metricIdx < Math.min(3, metrics.length); metricIdx += 1) {
    const [metric, label, note] = metrics[metricIdx];
    addMetricCard(slide, idx, 92 + metricIdx * 370, 404, 330, 174, metric, label, note, accents[metricIdx % accents.length]);
  }
  addReferenceCaption(slide, idx);
  addNotes(slide, data.notes, data.sources);
}

async function createDeck() {
  await ensureDirs();
  if (!SLIDES.length) {
    throw new Error("SLIDES must contain at least one slide.");
  }
  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  await slideCover(presentation);
  for (let idx = 2; idx <= SLIDES.length; idx += 1) {
    const data = SLIDES[idx - 1];
    if (data.metrics) {
      await slideMetrics(presentation, idx);
    } else {
      await slideCards(presentation, idx);
    }
  }
  return presentation;
}

async function saveBlobToFile(blob, filePath) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function writeInspectArtifact(presentation) {
  inspectRecords.unshift({
    kind: "deck",
    id: DECK_ID,
    slideCount: presentation.slides.count,
    slideSize: { width: W, height: H },
  });
  presentation.slides.items.forEach((slide, index) => {
    inspectRecords.splice(index + 1, 0, {
      kind: "slide",
      slide: index + 1,
      id: slide?.id || `slide-${index + 1}`,
    });
  });
  const lines = inspectRecords.map((record) => JSON.stringify(record)).join("\n") + "\n";
  await fs.writeFile(INSPECT_PATH, lines, "utf8");
}

async function currentRenderLoopCount() {
  const logPath = path.join(VERIFICATION_DIR, "render_verify_loops.ndjson");
  if (!(await pathExists(logPath))) return 0;
  const previous = await fs.readFile(logPath, "utf8");
  return previous.split(/\r?\n/).filter((line) => line.trim()).length;
}

async function nextRenderLoopNumber() {
  return (await currentRenderLoopCount()) + 1;
}

async function appendRenderVerifyLoop(presentation, previewPaths, pptxPath) {
  const logPath = path.join(VERIFICATION_DIR, "render_verify_loops.ndjson");
  const priorCount = await currentRenderLoopCount();
  const record = {
    kind: "render_verify_loop",
    deckId: DECK_ID,
    loop: priorCount + 1,
    maxLoops: MAX_RENDER_VERIFY_LOOPS,
    capReached: priorCount + 1 >= MAX_RENDER_VERIFY_LOOPS,
    timestamp: new Date().toISOString(),
    slideCount: presentation.slides.count,
    previewCount: previewPaths.length,
    previewDir: PREVIEW_DIR,
    inspectPath: INSPECT_PATH,
    pptxPath,
  };
  await fs.appendFile(logPath, JSON.stringify(record) + "\n", "utf8");
  return record;
}

async function verifyAndExport(presentation) {
  await ensureDirs();
  const nextLoop = await nextRenderLoopNumber();
  if (nextLoop > MAX_RENDER_VERIFY_LOOPS) {
    throw new Error(
      `Render/verify/fix loop cap reached: ${MAX_RENDER_VERIFY_LOOPS} total renders are allowed. ` +
        "Do not rerender; note any remaining visual issues in the final response.",
    );
  }
  await writeInspectArtifact(presentation);
  const previewPaths = [];
  for (let idx = 0; idx < presentation.slides.items.length; idx += 1) {
    const slide = presentation.slides.items[idx];
    const preview = await presentation.export({ slide, format: "png", scale: 1 });
    const previewPath = path.join(PREVIEW_DIR, `slide-${String(idx + 1).padStart(2, "0")}.png`);
    await saveBlobToFile(preview, previewPath);
    previewPaths.push(previewPath);
  }
  const pptxBlob = await PresentationFile.exportPptx(presentation);
  const pptxPath = path.join(OUT_DIR, "output.pptx");
  await pptxBlob.save(pptxPath);
  const loopRecord = await appendRenderVerifyLoop(presentation, previewPaths, pptxPath);
  return { pptxPath, loopRecord };
}

const presentation = await createDeck();
const result = await verifyAndExport(presentation);
console.log(result.pptxPath);
