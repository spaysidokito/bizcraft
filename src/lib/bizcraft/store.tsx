import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_ATTEMPTS,
  SEED_BADGES,
  SEED_PROFILES,
  SEED_PROGRESS,
  SEED_QUESTIONS,
  SEED_STORIES,
  SEED_STUDENT_BADGES,
  SEED_USERS,
  XP_RULES,
} from "./data";
import type {
  Badge,
  EntrepreneurStory,
  QuizAnswer,
  QuizAttempt,
  QuizQuestion,
  StudentBadge,
  StudentProfile,
  StudentProgress,
  User,
} from "./types";
import { loadDbFromSupabase, saveDbToSupabase, getSupabaseClient } from "./supabase";
import bcrypt from "bcryptjs";

/**
 * In-memory database mirroring the intended relational schema.
 * Swap `useState` + localStorage for real API/database calls later —
 * the shape of `Db` matches the planned tables one-to-one.
 */
export interface ActivityScenarioChoice {
  id: string;
  label: string;
  points: number;
}

export interface ActivityScenario {
  id: string;
  prompt: string;
  type: "mc" | "text";
  choices?: ActivityScenarioChoice[];
  keywords?: string[];
  bestChoiceId?: string;
  explanation?: string;
}

export interface ActivitySettings {
  countdownSeconds: number; // 3–30
  autoAdvance: boolean;     // when false, only the manual "Next now" button works
}

export const DEFAULT_ACTIVITY_SETTINGS: ActivitySettings = {
  countdownSeconds: 5,
  autoAdvance: true,
};

export const ACTIVITY_SCENARIOS_VERSION = 2;
const ACTIVITY_SCENARIOS_VERSION_KEY = "bizcraft.activity_scenarios.version";

export const DEFAULT_ACTIVITY_SCENARIOS: ActivityScenario[] = [
  {
    id: "s1",
    prompt: "Your supplier delivers late and you risk losing customers. What do you do?",
    type: "mc",
    choices: [
      { id: "c1", label: "Find an alternate supplier quickly", points: 3 },
      { id: "c2", label: "Contact supplier and negotiate faster delivery", points: 2 },
      { id: "c3", label: "Absorb delay and wait", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Find an alternate supplier quickly — reduces risk and keeps customers satisfied.",
  },
  {
    id: "s2",
    prompt: "A customer complains about product quality. How do you respond?",
    type: "mc",
    choices: [
      { id: "c1", label: "Offer refund/replace and investigate", points: 3 },
      { id: "c2", label: "Explain policy and decline", points: 0 },
      { id: "c3", label: "Apologize and ask for more details", points: 2 },
    ],
    bestChoiceId: "c1",
    explanation: "Offer refund/replace and investigate — prioritizes trust and finds root cause.",
  },
  {
    id: "s3",
    prompt: "You have leftover inventory that isn't selling. Which option increases cashflow fastest?",
    type: "mc",
    choices: [
      { id: "c1", label: "Run a limited-time discount/promo", points: 3 },
      { id: "c2", label: "Bundle with other products", points: 2 },
      { id: "c3", label: "Keep price and wait for demand", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Run a limited-time discount/promo — converts inventory to cash quickly.",
  },
  {
    id: "s4",
    prompt: "A supplier offers a bulk discount but requires larger upfront payment. What do you consider?",
    type: "mc",
    choices: [
      { id: "c1", label: "Calculate cashflow and accept if affordable", points: 3 },
      { id: "c2", label: "Always accept for lower unit cost", points: 1 },
      { id: "c3", label: "Decline to avoid cash strain", points: 1 },
    ],
    bestChoiceId: "c1",
    explanation: "Calculate cashflow and accept if affordable — weigh unit cost vs cashflow impact.",
  },
  {
    id: "s5",
    prompt: "A sudden cash shortage means you must prioritize payments. Which do you pay first?",
    type: "mc",
    choices: [
      { id: "c1", label: "Salaries and critical suppliers", points: 3 },
      { id: "c2", label: "Rent and utilities only", points: 2 },
      { id: "c3", label: "Delay all non-essential bills", points: 1 },
    ],
    bestChoiceId: "c1",
    explanation: "Salaries and critical suppliers — keeps operations running and protects relationships.",
  },
  {
    id: "s6",
    prompt: "A competitor drops price aggressively. What strategic move protects your business?",
    type: "mc",
    choices: [
      { id: "c1", label: "Differentiate with service/quality", points: 3 },
      { id: "c2", label: "Match price immediately", points: 1 },
      { id: "c3", label: "Ignore and maintain position", points: 1 },
    ],
    bestChoiceId: "c1",
    explanation: "Differentiate with service/quality — avoid price wars and preserve margins.",
  },
  {
    id: "s7",
    prompt: "Your best-selling product suddenly runs out of stock. What's your next move?",
    type: "mc",
    choices: [
      { id: "c1", label: "Contact supplier for rush restock and offer a substitute", points: 3 },
      { id: "c2", label: "Wait for the next scheduled delivery", points: 1 },
      { id: "c3", label: "Stop taking orders until restocked", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Contact supplier for rush restock and offer a substitute — minimizes lost sales while managing customer expectations.",
  },
  {
    id: "s8",
    prompt: "A key employee suddenly resigns. What's your priority action?",
    type: "mc",
    choices: [
      { id: "c1", label: "Reassign tasks and start hiring immediately", points: 3 },
      { id: "c2", label: "Wait and see if workload is manageable", points: 1 },
      { id: "c3", label: "Ask remaining staff to cover indefinitely", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Reassign tasks and start hiring immediately — keeps operations stable without burning out staff.",
  },
  {
    id: "s9",
    prompt: "You notice sales are strong online but weak in-store. What should you do?",
    type: "mc",
    choices: [
      { id: "c1", label: "Shift more resources to online channels", points: 3 },
      { id: "c2", label: "Increase in-store advertising only", points: 1 },
      { id: "c3", label: "Keep budget split evenly regardless of results", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Shift more resources to online channels — follow where demand and ROI are strongest.",
  },
  {
    id: "s10",
    prompt: "A regular customer asks for a discount you can't really afford to give. How do you respond?",
    type: "mc",
    choices: [
      { id: "c1", label: "Offer a smaller perk like added value or loyalty points instead", points: 3 },
      { id: "c2", label: "Give the discount to keep them happy", points: 1 },
      { id: "c3", label: "Refuse outright with no alternative", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Offer a smaller perk like added value or loyalty points instead — retains goodwill without hurting margins.",
  },
  {
    id: "s11",
    prompt: "Your monthly expenses are rising faster than revenue. What's the best first step?",
    type: "mc",
    choices: [
      { id: "c1", label: "Review and cut non-essential costs", points: 3 },
      { id: "c2", label: "Raise prices immediately", points: 1 },
      { id: "c3", label: "Take a loan to cover the gap", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Review and cut non-essential costs — addresses the root issue before adding financial risk.",
  },
  {
    id: "s12",
    prompt: "You receive a large order from a new client with no payment history. What do you do?",
    type: "mc",
    choices: [
      { id: "c1", label: "Request partial upfront payment before proceeding", points: 3 },
      { id: "c2", label: "Fulfill the full order on trust", points: 1 },
      { id: "c3", label: "Reject the order to avoid risk", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Request partial upfront payment before proceeding — balances opportunity with financial protection.",
  },
  {
    id: "s13",
    prompt: "Two staff members are in conflict and it's affecting team morale. What's your best response?",
    type: "mc",
    choices: [
      { id: "c1", label: "Meet with both separately then mediate a resolution", points: 3 },
      { id: "c2", label: "Let them resolve it on their own", points: 1 },
      { id: "c3", label: "Reprimand both publicly to set an example", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Meet with both separately then mediate a resolution — addresses the issue fairly and preserves team morale.",
  },
  {
    id: "s14",
    prompt: "A new regulation will increase your compliance costs. What's your best approach?",
    type: "mc",
    choices: [
      { id: "c1", label: "Review the requirement and adjust budget/pricing accordingly", points: 3 },
      { id: "c2", label: "Delay compliance until forced to act", points: 1 },
      { id: "c3", label: "Absorb the cost without changing anything", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Review the requirement and adjust budget/pricing accordingly — stays compliant while protecting margins.",
  },
  {
    id: "s15",
    prompt: "You're choosing between two suppliers: one cheaper but less reliable, one pricier but consistent. Which do you pick?",
    type: "mc",
    choices: [
      { id: "c1", label: "Choose the reliable supplier for critical items", points: 3 },
      { id: "c2", label: "Always choose the cheaper option", points: 1 },
      { id: "c3", label: "Split orders evenly between both without evaluation", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Choose the reliable supplier for critical items — consistency protects customer trust and operations.",
  },
  {
    id: "s16",
    prompt: "Social media engagement is dropping despite regular posting. What should you try next?",
    type: "mc",
    choices: [
      { id: "c1", label: "Analyze what content performed best and adjust strategy", points: 3 },
      { id: "c2", label: "Post more frequently without changes", points: 1 },
      { id: "c3", label: "Stop social media efforts entirely", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Analyze what content performed best and adjust strategy — data-driven adjustment improves results over guesswork.",
  },
  {
    id: "s17",
    prompt: "A major client wants a custom order outside your usual product line. What do you do?",
    type: "mc",
    choices: [
      { id: "c1", label: "Assess feasibility and profitability before committing", points: 3 },
      { id: "c2", label: "Accept immediately to keep the client happy", points: 1 },
      { id: "c3", label: "Decline without evaluating the opportunity", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Assess feasibility and profitability before committing — avoids overextending resources on a bad deal.",
  },
  {
    id: "s18",
    prompt: "Your business page gets a negative public review. How do you respond?",
    type: "mc",
    choices: [
      { id: "c1", label: "Reply professionally and offer to resolve the issue", points: 3 },
      { id: "c2", label: "Delete or ignore the review", points: 1 },
      { id: "c3", label: "Argue with the customer publicly", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Reply professionally and offer to resolve the issue — protects reputation and shows accountability.",
  },
  {
    id: "s19",
    prompt: "You're deciding whether to rent a bigger space as your business grows. What's your best approach?",
    type: "mc",
    choices: [
      { id: "c1", label: "Analyze projected revenue against added rent cost", points: 3 },
      { id: "c2", label: "Move immediately to avoid missing growth", points: 1 },
      { id: "c3", label: "Stay in the current space indefinitely", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Analyze projected revenue against added rent cost — ensures growth is financially sustainable.",
  },
  {
    id: "s20",
    prompt: "A staff member consistently arrives late but is otherwise a strong performer. What's your best move?",
    type: "mc",
    choices: [
      { id: "c1", label: "Have a private conversation to understand and address the issue", points: 3 },
      { id: "c2", label: "Ignore it since their work is good", points: 1 },
      { id: "c3", label: "Terminate them immediately", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Have a private conversation to understand and address the issue — fair and preserves a valuable employee.",
  },
  {
    id: "s21",
    prompt: "You have extra capital and are deciding where to invest it. What's the best first priority?",
    type: "mc",
    choices: [
      { id: "c1", label: "Strengthen your core operations or best-performing product", points: 3 },
      { id: "c2", label: "Diversify into an unrelated venture immediately", points: 1 },
      { id: "c3", label: "Save it without a clear plan", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Strengthen your core operations or best-performing product — compounds existing strengths before diversifying.",
  },
  {
    id: "s22",
    prompt: "Your delivery costs are eating into your profit margin. What's your best solution?",
    type: "mc",
    choices: [
      { id: "c1", label: "Negotiate better rates or set a minimum order for free delivery", points: 3 },
      { id: "c2", label: "Absorb the cost to stay competitive", points: 1 },
      { id: "c3", label: "Stop offering delivery entirely", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Negotiate better rates or set a minimum order for free delivery — protects margins without losing customers.",
  },
  {
    id: "s23",
    prompt: "A supplier you've worked with for years starts delivering lower-quality materials. What's your best step?",
    type: "mc",
    choices: [
      { id: "c1", label: "Raise the issue directly and request improvement or alternatives", points: 3 },
      { id: "c2", label: "Continue as usual to preserve the relationship", points: 1 },
      { id: "c3", label: "Switch suppliers immediately without discussion", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Raise the issue directly and request improvement or alternatives — protects quality while respecting the relationship.",
  },
  {
    id: "s24",
    prompt: "You're launching a new product and unsure how to price it. What's your best approach?",
    type: "mc",
    choices: [
      { id: "c1", label: "Research competitor pricing and calculate your cost margins", points: 3 },
      { id: "c2", label: "Price it the same as your other products", points: 1 },
      { id: "c3", label: "Set the lowest price to attract buyers fast", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Research competitor pricing and calculate your cost margins — ensures pricing is both competitive and profitable.",
  },
  {
    id: "s25",
    prompt: "Your team is overwhelmed during peak season. What's the best short-term fix?",
    type: "mc",
    choices: [
      { id: "c1", label: "Hire temporary staff or outsource specific tasks", points: 3 },
      { id: "c2", label: "Push current staff to work longer hours", points: 1 },
      { id: "c3", label: "Turn away excess orders", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Hire temporary staff or outsource specific tasks — meets demand without burning out your core team.",
  },
  {
    id: "s26",
    prompt: "A long-time customer hasn't purchased in months. What's your best re-engagement move?",
    type: "mc",
    choices: [
      { id: "c1", label: "Send a personalized offer or check-in message", points: 3 },
      { id: "c2", label: "Wait for them to return on their own", points: 1 },
      { id: "c3", label: "Remove them from your customer list", points: 0 },
    ],
    bestChoiceId: "c1",
    explanation: "Send a personalized offer or check-in message — proactive outreach often revives dormant customers.",
  },
];

function cloneActivityScenarios(): ActivityScenario[] {
  return DEFAULT_ACTIVITY_SCENARIOS.map((s) => ({
    ...s,
    choices: s.choices?.map((c) => ({ ...c })),
    keywords: s.keywords ? [...s.keywords] : undefined,
  }));
}

function shouldUpgradeActivityScenarios(scenarios: ActivityScenario[] | undefined): boolean {
  if (!scenarios?.length) return true;
  if (scenarios.some((s) => s.type === "text")) return true;
  if (scenarios.length < DEFAULT_ACTIVITY_SCENARIOS.length) return true;
  return !DEFAULT_ACTIVITY_SCENARIOS.every((d) => scenarios.some((s) => s.id === d.id));
}

function resolveActivityScenarios(stored: ActivityScenario[] | undefined): ActivityScenario[] {
  try {
    const version = Number(window.localStorage.getItem(ACTIVITY_SCENARIOS_VERSION_KEY) ?? "1");
    if (version < ACTIVITY_SCENARIOS_VERSION || shouldUpgradeActivityScenarios(stored)) {
      window.localStorage.setItem(ACTIVITY_SCENARIOS_VERSION_KEY, String(ACTIVITY_SCENARIOS_VERSION));
      return cloneActivityScenarios();
    }
  } catch {
    /* ignore storage errors */
  }
  return stored?.length ? stored : cloneActivityScenarios();
}

export interface Db {
  users: User[];
  student_profiles: StudentProfile[];
  entrepreneur_stories: EntrepreneurStory[];
  quiz_questions: QuizQuestion[];
  quiz_attempts: QuizAttempt[];
  badges: Badge[];
  student_badges: StudentBadge[];
  student_progress: StudentProgress[];
  session_user_id: string | null;
  activity_settings: ActivitySettings;
  activity_scenarios: ActivityScenario[];
}

const STORAGE_KEY = "bizcraft.db.v1";
const SESSION_STORAGE_KEY = "bizcraft.session_user_id";

function seedDb(): Db {
  return {
    users: SEED_USERS,
    student_profiles: SEED_PROFILES,
    entrepreneur_stories: SEED_STORIES,
    quiz_questions: SEED_QUESTIONS,
    quiz_attempts: SEED_ATTEMPTS,
    badges: SEED_BADGES,
    student_badges: SEED_STUDENT_BADGES,
    student_progress: SEED_PROGRESS,
    session_user_id: null,
    activity_settings: { ...DEFAULT_ACTIVITY_SETTINGS },
    activity_scenarios: cloneActivityScenarios(),
  };
}

export interface StudentStats {
  xp: number;
  stories_completed: number;
  quizzes_completed: number;
  average_score: number;
  badges: Badge[];
}

interface StoreValue {
  db: Db;
  ready: boolean;
  currentUser: User | null;
  profile: StudentProfile | null;
  login: (identifier: string, password: string) => { ok: boolean; error?: string; role?: string };
  register: (input: {
    full_name: string;
    email: string;
    username: string;
    password: string;
    grade_level?: "Grade 11" | "Grade 12";
    section?: string;
  }) => { ok: boolean; error?: string };
  logout: () => void;
  statsFor: (studentId: string) => StudentStats;
  progressFor: (studentId: string, storyId: string) => StudentProgress | undefined;
  markStoryViewed: (storyId: string) => void;
  completeStory: (storyId: string) => void;
  submitQuiz: (storyId: string, answers: QuizAnswer[]) => QuizAttempt;
  latestAttempt: (studentId: string, storyId: string) => QuizAttempt | undefined;
  questionsForStory: (storyId: string) => QuizQuestion[];
  // admin
  saveStory: (story: EntrepreneurStory) => void;
  deleteStory: (id: string) => void;
  saveQuestion: (question: QuizQuestion) => void;
  deleteQuestion: (id: string) => void;
  saveBadge: (badge: Badge) => void;
  deleteBadge: (id: string) => void;
  saveStudent: (student: User, profile: StudentProfile) => void;
  deleteStudent: (id: string) => void;
  updateProfile: (updates: { full_name?: string; email?: string; username?: string; avatar_url?: string }) => void;
  resetDemoData: () => void;
  awardXp: (xp: number) => void;
  awardBadge: (badgeId: string) => void;
  saveActivitySettings: (settings: ActivitySettings) => void;
  saveActivityScenario: (scenario: ActivityScenario) => void;
  deleteActivityScenario: (id: string) => void;
  resetActivityScenarios: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function BizCraftProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(seedDb);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const supabaseDb = await loadDbFromSupabase();
        if (!cancelled && supabaseDb) {
          setDb((prev) => ({
            ...supabaseDb,
            session_user_id: prev.session_user_id,
            activity_settings: supabaseDb.activity_settings ?? prev.activity_settings ?? { ...DEFAULT_ACTIVITY_SETTINGS },
            activity_scenarios: resolveActivityScenarios(supabaseDb.activity_scenarios ?? prev.activity_scenarios),
          }));
        } else if (!cancelled) {
          try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as Db;
              setDb({
                ...seedDb(),
                ...parsed,
                activity_scenarios: resolveActivityScenarios(parsed.activity_scenarios),
              });
            } else {
              setDb((prev) => ({
                ...prev,
                activity_scenarios: resolveActivityScenarios(prev.activity_scenarios),
              }));
            }
          } catch {
            /* ignore corrupt storage */
          }
        }

        if (!cancelled) {
          const savedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
          if (savedSession) {
            setDb((prev) => ({ ...prev, session_user_id: savedSession }));
          }
        }
      } catch {
        /* ignore backend errors, fall back to local demo */
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveDbToSupabase(db).catch(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      } catch {
        /* ignore quota errors */
      }
    });
    try {
      if (db.session_user_id) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, db.session_user_id);
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      /* ignore quota errors */
    }
  }, [db, ready]);

  // Poll Supabase periodically to pick up remote changes from other clients/deployments
  useEffect(() => {
    if (!ready) return;
    const client = getSupabaseClient();
    if (!client) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const supabaseDb = await loadDbFromSupabase();
        if (!cancelled && supabaseDb) {
          setDb((prev) => ({
            ...supabaseDb,
            session_user_id: prev.session_user_id,
            activity_settings: supabaseDb.activity_settings ?? prev.activity_settings ?? { ...DEFAULT_ACTIVITY_SETTINGS },
            activity_scenarios: resolveActivityScenarios(supabaseDb.activity_scenarios ?? prev.activity_scenarios),
          }));
        }
      } catch {
        /* ignore */
      }
    };
    // run immediately then every 5s
    void poll();
    const id = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [ready]);

  const currentUser = useMemo(
    () => db.users.find((u) => u.id === db.session_user_id) ?? null,
    [db.users, db.session_user_id],
  );
  const profile = useMemo(
    () => db.student_profiles.find((p) => p.user_id === db.session_user_id) ?? null,
    [db.student_profiles, db.session_user_id],
  );

  const login: StoreValue["login"] = useCallback(
    (identifier, password) => {
      const id = identifier.trim().toLowerCase();
      const user = db.users.find(
        (u) => u.email.toLowerCase() === id || u.username.toLowerCase() === id,
      );
      if (!user) return { ok: false, error: "Incorrect email/username or password." };

      // Password verification: support bcrypt-hashed passwords and legacy plaintext.
      let passwordMatches = false;
      try {
        if (typeof user.password === "string" && user.password.startsWith("$2")) {
          passwordMatches = bcrypt.compareSync(password, user.password);
        } else {
          // Legacy plaintext match — if correct, re-hash and persist the hashed password.
          passwordMatches = user.password === password;
          if (passwordMatches) {
            const hashed = bcrypt.hashSync(password, 10);
            const updated: User = { ...user, password: hashed };
            // Update local DB immediately
            setDb((prev) => ({
              ...prev,
              users: prev.users.map((u) => (u.id === updated.id ? updated : u)),
            }));
            // Persist to Supabase if available
            const client = getSupabaseClient();
            if (client) {
              void (async () => {
                try {
                  await client.from("users").upsert([updated], { onConflict: "id" });
                } catch {
                  /* ignore remote errors */
                }
              })();
            }
          }
        }
      } catch {
        passwordMatches = false;
      }

      if (!passwordMatches) {
        return { ok: false, error: "Incorrect email/username or password." };
      }

      setDb((prev) => {
        const hasProfile = prev.student_profiles.some((p) => p.user_id === user.id);
        return {
          ...prev,
          session_user_id: user.id,
          student_profiles: hasProfile
            ? prev.student_profiles
            : [
                ...prev.student_profiles,
                {
                  user_id: user.id,
                  grade_level: "",
                  section: "",
                  xp: 0,
                  avatar_url: null,
                },
              ],
        };
      });
      return { ok: true, role: user.role };
    },
    [db.users],
  );

  const register: StoreValue["register"] = useCallback(
    (input) => {
      const exists = db.users.some(
        (u) =>
          u.email.toLowerCase() === input.email.trim().toLowerCase() ||
          u.username.toLowerCase() === input.username.trim().toLowerCase(),
      );
      if (exists) return { ok: false, error: "That email or username is already registered." };
      const id = `u-${Date.now()}`;
      const hashed = bcrypt.hashSync(input.password, 10);
      const user: User = {
        id,
        full_name: input.full_name.trim(),
        email: input.email.trim(),
        username: input.username.trim(),
        password: hashed,
        role: "student",
      };
      const newProfile: StudentProfile = {
        user_id: id,
        grade_level: input.grade_level?.trim() ?? "",
        section: input.section?.trim() ?? "",
        xp: 0,
        avatar_url: null,
      };
      setDb((prev) => ({
        ...prev,
        users: [...prev.users, user],
        student_profiles: [...prev.student_profiles, newProfile],
        session_user_id: id,
      }));

      // Persist new user to Supabase immediately if available
      const client = getSupabaseClient();
      if (client) {
        void (async () => {
          try {
            await client.from("users").upsert([user], { onConflict: "id" });
          } catch {}
        })();
        void (async () => {
          try {
            await client.from("student_profiles").upsert([newProfile], { onConflict: "user_id" });
          } catch {}
        })();
      }
      return { ok: true };
    },
    [db.users],
  );

  const logout = useCallback(() => setDb((prev) => ({ ...prev, session_user_id: null })), []);

  const statsFor: StoreValue["statsFor"] = useCallback(
    (studentId) => {
      const xp = db.student_profiles.find((p) => p.user_id === studentId)?.xp ?? 0;
      const stories = db.student_progress.filter(
        (p) => p.student_id === studentId && p.status === "completed",
      ).length;
      const attempts = db.quiz_attempts.filter((a) => a.student_id === studentId);
      const average = attempts.length
        ? Math.round(
            attempts.reduce((s, a) => s + (a.score / a.total_questions) * 100, 0) / attempts.length,
          )
        : 0;
      const badges = db.student_badges
        .filter((sb) => sb.student_id === studentId)
        .map((sb) => db.badges.find((b) => b.id === sb.badge_id))
        .filter((b): b is Badge => Boolean(b));
      return {
        xp,
        stories_completed: stories,
        quizzes_completed: attempts.length,
        average_score: average,
        badges,
      };
    },
    [db],
  );

  const progressFor: StoreValue["progressFor"] = useCallback(
    (studentId, storyId) =>
      db.student_progress.find((p) => p.student_id === studentId && p.story_id === storyId),
    [db.student_progress],
  );

  const markStoryViewed = useCallback(
    (storyId: string) => {
      const sid = db.session_user_id;
      if (!sid) return;
      setDb((prev) => {
        const existing = prev.student_progress.find(
          (p) => p.student_id === sid && p.story_id === storyId,
        );
        const now = new Date().toISOString();
        if (existing) {
          return {
            ...prev,
            student_progress: prev.student_progress.map((p) =>
              p === existing ? { ...p, last_viewed_at: now } : p,
            ),
          };
        }
        return {
          ...prev,
          student_progress: [
            ...prev.student_progress,
            { student_id: sid, story_id: storyId, status: "in_progress", last_viewed_at: now },
          ],
        };
      });
    },
    [db.session_user_id],
  );

  const completeStory = useCallback(
    (storyId: string) => {
      const sid = db.session_user_id;
      if (!sid) return;
      setDb((prev) => {
        const existing = prev.student_progress.find(
          (p) => p.student_id === sid && p.story_id === storyId,
        );
        if (existing?.status === "completed") return prev;
        const now = new Date().toISOString();
        const progress = existing
          ? prev.student_progress.map((p) =>
              p === existing
                ? { ...p, status: "completed" as const, last_viewed_at: now }
                : p,
            )
          : [
              ...prev.student_progress,
              {
                student_id: sid,
                story_id: storyId,
                status: "completed" as const,
                last_viewed_at: now,
              },
            ];
        return {
          ...prev,
          student_progress: progress,
          student_profiles: prev.student_profiles.map((p) =>
            p.user_id === sid ? { ...p, xp: p.xp + XP_RULES.story_completed } : p,
          ),
        };
      });
    },
    [db.session_user_id],
  );

  const submitQuiz = useCallback(
    (storyId: string, answers: QuizAnswer[]): QuizAttempt => {
      const sid = db.session_user_id!;
      const score = answers.filter((a) => a.is_correct).length;
      const xpEarned = score * XP_RULES.correct_answer + XP_RULES.quiz_completed;
      const attempt: QuizAttempt = {
        id: `a-${Date.now()}`,
        student_id: sid,
        story_id: storyId,
        score,
        total_questions: answers.length,
        xp_earned: xpEarned,
        answers,
        completed_at: new Date().toISOString(),
      };

      setDb((prev) => {
        const attemptsAll = [...prev.quiz_attempts, attempt];
        const progressAll = (() => {
          const existing = prev.student_progress.find(
            (p) => p.student_id === sid && p.story_id === storyId,
          );
          const now = new Date().toISOString();
          if (existing) {
            return prev.student_progress.map((p) =>
              p === existing ? { ...p, status: "completed" as const, last_viewed_at: now } : p,
            );
          }
          return [
            ...prev.student_progress,
            {
              student_id: sid,
              story_id: storyId,
              status: "completed" as const,
              last_viewed_at: now,
            },
          ];
        })();

        // badge evaluation
        const storiesDone = progressAll.filter(
          (p) => p.student_id === sid && p.status === "completed",
        ).length;
        const myAttempts = attemptsAll.filter((a) => a.student_id === sid);
        const bestPct = Math.max(
          ...myAttempts.map((a) => (a.score / a.total_questions) * 100),
          0,
        );
        const totalStories = prev.entrepreneur_stories.filter((s) => s.is_published).length;
        const owned = new Set(
          prev.student_badges.filter((b) => b.student_id === sid).map((b) => b.badge_id),
        );
        const earned: StudentBadge[] = [];
        const grant = (badgeId: string, when: boolean) => {
          if (when && !owned.has(badgeId) && prev.badges.some((b) => b.id === badgeId)) {
            earned.push({
              student_id: sid,
              badge_id: badgeId,
              earned_at: new Date().toISOString(),
            });
            owned.add(badgeId);
          }
        };
        grant("b-1", storiesDone >= 1);
        grant("b-2", myAttempts.length >= 1);
        grant("b-3", storiesDone >= 5);
        grant("b-4", bestPct >= 90);
        grant("b-5", totalStories > 0 && storiesDone >= totalStories);

        return {
          ...prev,
          quiz_attempts: attemptsAll,
          student_progress: progressAll,
          student_badges: [...prev.student_badges, ...earned],
          student_profiles: prev.student_profiles.map((p) =>
            p.user_id === sid ? { ...p, xp: p.xp + xpEarned } : p,
          ),
        };
      });

      return attempt;
    },
    [db.session_user_id],
  );

  const latestAttempt: StoreValue["latestAttempt"] = useCallback(
    (studentId, storyId) =>
      [...db.quiz_attempts]
        .filter((a) => a.student_id === studentId && a.story_id === storyId)
        .sort((a, b) => b.completed_at.localeCompare(a.completed_at))[0],
    [db.quiz_attempts],
  );

  const questionsForStory: StoreValue["questionsForStory"] = useCallback(
    (storyId) => db.quiz_questions.filter((q) => q.story_id === storyId),
    [db.quiz_questions],
  );

  const saveStory = useCallback((story: EntrepreneurStory) => {
    setDb((prev) => ({
      ...prev,
      entrepreneur_stories: prev.entrepreneur_stories.some((s) => s.id === story.id)
        ? prev.entrepreneur_stories.map((s) => (s.id === story.id ? story : s))
        : [...prev.entrepreneur_stories, story],
    }));
  }, []);

  const deleteStory = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      entrepreneur_stories: prev.entrepreneur_stories.filter((s) => s.id !== id),
      quiz_questions: prev.quiz_questions.filter((q) => q.story_id !== id),
    }));
  }, []);

  const saveQuestion = useCallback((question: QuizQuestion) => {
    setDb((prev) => ({
      ...prev,
      quiz_questions: prev.quiz_questions.some((q) => q.id === question.id)
        ? prev.quiz_questions.map((q) => (q.id === question.id ? question : q))
        : [...prev.quiz_questions, question],
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setDb((prev) => ({ ...prev, quiz_questions: prev.quiz_questions.filter((q) => q.id !== id) }));
  }, []);

  const saveBadge = useCallback((badge: Badge) => {
    setDb((prev) => ({
      ...prev,
      badges: prev.badges.some((b) => b.id === badge.id)
        ? prev.badges.map((b) => (b.id === badge.id ? badge : b))
        : [...prev.badges, badge],
    }));
  }, []);

  const deleteBadge = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      badges: prev.badges.filter((b) => b.id !== id),
      student_badges: prev.student_badges.filter((sb) => sb.badge_id !== id),
    }));
  }, []);

  const saveStudent = useCallback((student: User, profile: StudentProfile) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.some((u) => u.id === student.id)
        ? prev.users.map((u) => (u.id === student.id ? student : u))
        : [...prev.users, student],
      student_profiles: prev.student_profiles.some((p) => p.user_id === student.id)
        ? prev.student_profiles.map((p) => (p.user_id === student.id ? profile : p))
        : [...prev.student_profiles, profile],
    }));

    const client = getSupabaseClient();
    if (client) {
      void (async () => {
        try {
          await client.from("users").upsert([student], { onConflict: "id" });
          await client
            .from("student_profiles")
            .upsert([profile], { onConflict: "user_id" });
        } catch {
          /* ignore remote errors */
        }
      })();
    }
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
      student_profiles: prev.student_profiles.filter((p) => p.user_id !== id),
      quiz_attempts: prev.quiz_attempts.filter((a) => a.student_id !== id),
      student_progress: prev.student_progress.filter((p) => p.student_id !== id),
      student_badges: prev.student_badges.filter((sb) => sb.student_id !== id),
      session_user_id: prev.session_user_id === id ? null : prev.session_user_id,
    }));

    const client = getSupabaseClient();
    if (client) {
      void (async () => {
        try {
          await client.from("student_badges").delete().eq("student_id", id);
          await client.from("student_progress").delete().eq("student_id", id);
          await client.from("quiz_attempts").delete().eq("student_id", id);
          await client.from("student_profiles").delete().eq("user_id", id);
          await client.from("users").delete().eq("id", id);
        } catch {
          /* ignore */
        }
      })();
    }
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = seedDb();
    setDb(fresh);
  }, []);

  const saveActivitySettings = useCallback((settings: ActivitySettings) => {
    setDb((prev) => ({ ...prev, activity_settings: { ...settings } }));
  }, []);

  const saveActivityScenario = useCallback((scenario: ActivityScenario) => {
    setDb((prev) => {
      const existing = prev.activity_scenarios ?? DEFAULT_ACTIVITY_SCENARIOS;
      return {
        ...prev,
        activity_scenarios: existing.some((s) => s.id === scenario.id)
          ? existing.map((s) => (s.id === scenario.id ? scenario : s))
          : [...existing, scenario],
      };
    });
  }, []);

  const deleteActivityScenario = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      activity_scenarios: (prev.activity_scenarios ?? DEFAULT_ACTIVITY_SCENARIOS).filter((s) => s.id !== id),
    }));
  }, []);

  const resetActivityScenarios = useCallback(() => {
    try {
      window.localStorage.setItem(ACTIVITY_SCENARIOS_VERSION_KEY, String(ACTIVITY_SCENARIOS_VERSION));
    } catch {
      /* ignore storage errors */
    }
    setDb((prev) => ({ ...prev, activity_scenarios: cloneActivityScenarios() }));
  }, []);

  const updateProfile = useCallback(
    (updates: { full_name?: string; email?: string; username?: string; avatar_url?: string }) => {
      setDb((prev) => {
        if (!prev.session_user_id) return prev;
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === prev.session_user_id
              ? {
                  ...u,
                  ...(updates.full_name !== undefined && { full_name: updates.full_name }),
                  ...(updates.email !== undefined && { email: updates.email }),
                  ...(updates.username !== undefined && { username: updates.username }),
                }
              : u,
          ),
          student_profiles: prev.student_profiles.map((p) =>
            p.user_id === prev.session_user_id
              ? {
                  ...p,
                  ...(updates.avatar_url !== undefined && { avatar_url: updates.avatar_url }),
                }
              : p,
          ),
        };
      });
    },
    [],
  );

  const awardXp = useCallback((xp: number) => {
    const sid = db.session_user_id;
    if (!sid) return;
    setDb((prev) => ({
      ...prev,
      student_profiles: prev.student_profiles.map((p) =>
        p.user_id === sid ? { ...p, xp: p.xp + xp } : p,
      ),
    }));
  }, [db.session_user_id]);

  const awardBadge = useCallback((badgeId: string) => {
    const sid = db.session_user_id;
    if (!sid) return;
    setDb((prev) => {
      const owned = new Set(prev.student_badges.filter((b) => b.student_id === sid).map((b) => b.badge_id));
      if (owned.has(badgeId)) return prev;
      const entry = { student_id: sid, badge_id: badgeId, earned_at: new Date().toISOString() };
      // persist to Supabase if available
      const client = getSupabaseClient();
      if (client) {
        void (async () => {
          try {
            await client.from("student_badges").upsert([entry], { onConflict: ["student_id", "badge_id"] });
          } catch {
            /* ignore */
          }
        })();
      }
      return {
        ...prev,
        student_badges: [...prev.student_badges, entry],
      };
    });
  }, [db.session_user_id]);

  const value: StoreValue = {
    db,
    ready,
    currentUser,
    profile,
    login,
    register,
    logout,
    statsFor,
    progressFor,
    markStoryViewed,
    completeStory,
    submitQuiz,
    latestAttempt,
    questionsForStory,
    saveStory,
    deleteStory,
    saveQuestion,
    deleteQuestion,
    saveBadge,
    deleteBadge,
    saveStudent,
    deleteStudent,
    updateProfile,
    resetDemoData,
    awardXp,
    awardBadge,
    saveActivitySettings,
    saveActivityScenario,
    deleteActivityScenario,
    resetActivityScenarios,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useBizCraft() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useBizCraft must be used inside BizCraftProvider");
  return ctx;
}
