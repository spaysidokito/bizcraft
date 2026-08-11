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

/**
 * In-memory database mirroring the intended relational schema.
 * Swap `useState` + localStorage for real API/database calls later —
 * the shape of `Db` matches the planned tables one-to-one.
 */
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
}

const STORAGE_KEY = "bizcraft.db.v1";

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
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function BizCraftProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(seedDb);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDb({ ...seedDb(), ...(JSON.parse(raw) as Db) });
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* ignore quota errors */
    }
  }, [db, ready]);

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
      if (!user || user.password !== password) {
        return { ok: false, error: "Incorrect email/username or password." };
      }
      setDb((prev) => ({ ...prev, session_user_id: user.id }));
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
      const user: User = {
        id,
        full_name: input.full_name.trim(),
        email: input.email.trim(),
        username: input.username.trim(),
        password: input.password,
        role: "student",
      };
      const newProfile: StudentProfile = {
        user_id: id,
        grade_level: input.grade_level ?? "Grade 11",
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

  const resetDemoData = useCallback(() => {
    const fresh = seedDb();
    setDb(fresh);
  }, []);

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
    resetDemoData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useBizCraft() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useBizCraft must be used inside BizCraftProvider");
  return ctx;
}
