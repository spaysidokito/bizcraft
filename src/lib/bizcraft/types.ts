/**
 * BizCraft data model.
 *
 * These interfaces intentionally mirror a relational schema so the mock
 * store can later be swapped for a real database (users, student_profiles,
 * entrepreneur_stories, quiz_questions, quiz_choices, quiz_attempts,
 * quiz_answers, badges, student_badges, student_progress).
 */

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  password: string; // demo only — a real backend stores a hash
  role: UserRole;
}

export interface StudentProfile {
  user_id: string;
  grade_level: "Grade 11" | "Grade 12";
  section: string;
  xp: number;
  avatar_url: string | null;
}

export interface EntrepreneurStory {
  id: string;
  name: string;
  business_name: string;
  business_type: string;
  location: string;
  photo_url: string;
  short_description: string;
  biography: string;
  video_url: string;
  content: string[];
  key_lessons: string[];
  is_published: boolean;
}

export interface QuizChoice {
  id: string;
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizQuestion {
  id: string;
  story_id: string;
  question_text: string;
  choices: QuizChoice[];
  correct_choice_id: string;
  explanation: string;
}

export interface QuizAnswer {
  question_id: string;
  choice_id: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  story_id: string;
  score: number;
  total_questions: number;
  xp_earned: number;
  answers: QuizAnswer[];
  completed_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: string;
}

export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
}

export interface StudentProgress {
  student_id: string;
  story_id: string;
  status: "in_progress" | "completed";
  last_viewed_at: string;
}

export interface Level {
  level: number;
  title: string;
  min_xp: number;
}
