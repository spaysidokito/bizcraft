import photo1 from "@/assets/entrepreneur-1.jpg";
import photo2 from "@/assets/entrepreneur-2.jpg";
import photo3 from "@/assets/entrepreneur-3.jpg";
import photo4 from "@/assets/entrepreneur-4.jpg";
import photo5 from "@/assets/entrepreneur-5.jpg";
import photo6 from "@/assets/entrepreneur-6.jpg";
import photo7 from "@/assets/entrepreneur-7.jpg";
import type {
  Badge,
  EntrepreneurStory,
  Level,
  QuizQuestion,
  StudentBadge,
  StudentProfile,
  StudentProgress,
  QuizAttempt,
  User,
} from "./types";

export const LEVELS: Level[] = [
  { level: 1, title: "Entrepreneur Beginner", min_xp: 0 },
  { level: 2, title: "Business Explorer", min_xp: 150 },
  { level: 3, title: "Aspiring Entrepreneur", min_xp: 350 },
  { level: 4, title: "Business Builder", min_xp: 600 },
  { level: 5, title: "Future Entrepreneur", min_xp: 900 },
];

export const XP_RULES = {
  story_completed: 30,
  correct_answer: 20,
  quiz_completed: 25,
};

export const SEED_USERS: User[] = [
  {
    id: "u-1",
    full_name: "Andrea Villanueva",
    email: "student@bizcraft.edu.ph",
    username: "andrea",
    password: "student123",
    role: "student",
  },
  {
    id: "u-2",
    full_name: "Mark Delos Reyes",
    email: "mark.delosreyes@bizcraft.edu.ph",
    username: "markdr",
    password: "student123",
    role: "student",
  },
  {
    id: "u-3",
    full_name: "Kyla Santos",
    email: "kyla.santos@bizcraft.edu.ph",
    username: "kylas",
    password: "student123",
    role: "student",
  },
  {
    id: "u-4",
    full_name: "Ms. Rowena Cruz",
    email: "admin@bizcraft.edu.ph",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
];

export const SEED_PROFILES: StudentProfile[] = [
  { user_id: "u-1", grade_level: "Grade 12", section: "ABM - Peter Drucker", xp: 210, avatar_url: null },
  { user_id: "u-2", grade_level: "Grade 11", section: "ABM - Henry Sy", xp: 95, avatar_url: null },
  { user_id: "u-3", grade_level: "Grade 12", section: "ABM - Peter Drucker", xp: 420, avatar_url: null },
];

export const SEED_STORIES: EntrepreneurStory[] = [
  {
    id: "s-1",
    name: "Marilou Bautista",
    business_name: "Nanay Lou's Bakeshop",
    business_type: "Food & Beverage",
    location: "Malolos, Bulacan",
    photo_url: photo1,
    short_description:
      "Started with a borrowed oven and PHP 3,000 capital. Now supplies bread to 14 sari-sari stores.",
    biography:
      "Marilou Bautista is a 46-year-old baker from Malolos, Bulacan. She finished a TESDA baking short course after her husband lost his job in 2016. With PHP 3,000 in savings and a borrowed oven, she started selling pandesal to neighbors every morning before dawn.",
    video_url: "https://www.youtube.com/watch?v=example-marilou",
    content: [
      "Q: How did you begin your business?\nA: I started very small. I baked 100 pieces of pandesal each morning and sold them door to door. I did not have a store, only a bilao and a plastic cover. My capital was PHP 3,000, which I borrowed from my sister.",
      "Q: What was your biggest challenge?\nA: Pricing. In the first three months I was actually losing money because I did not compute the cost of gas, flour, and my own labor. A cooperative officer taught me how to do a simple costing sheet. That single lesson saved my business.",
      "Q: How did you grow?\nA: I reinvested almost everything for two years. Instead of buying new appliances for the house, I bought a second oven and then a display case. Slowly, sari-sari stores began ordering from me because I was consistent with delivery time.",
      "Q: What advice would you give to ABM students?\nA: Learn to record. Even a notebook is enough. If you do not know your numbers, you do not know your business.",
    ],
    key_lessons: [
      "Know your costs before setting your selling price.",
      "Start small, but start with accurate records.",
      "Reinvest profit into the business during the early years.",
      "Consistency and reliability build repeat customers.",
    ],
    is_published: true,
  },
  {
    id: "s-2",
    name: "Jerome Aquino",
    business_name: "Kapé Tres Coffee",
    business_type: "Retail / Café",
    location: "Baguio City, Benguet",
    photo_url: photo2,
    short_description:
      "Left a call center job to open a 12-seat café sourcing beans directly from Benguet farmers.",
    biography:
      "Jerome Aquino, 34, worked six years in a BPO company before opening Kapé Tres in 2019. He built the café around direct-trade Benguet coffee, paying farmers above the market rate and printing the farm name on every cup.",
    video_url: "https://www.youtube.com/watch?v=example-jerome",
    content: [
      "Q: Why did you leave a stable job?\nA: I did not leave blindly. I saved for two years and ran the business on weekends first, selling brewed coffee at a Sunday market. I only resigned when the weekend sales matched half of my salary.",
      "Q: What happened during the pandemic?\nA: We lost 80% of dine-in sales in one week. We shifted to selling coffee beans and bottled cold brew for delivery. That pivot kept us alive and it is now 40% of our income.",
      "Q: What makes your business different?\nA: Our supplier relationship. We pay farmers directly and we tell their story. Customers are willing to pay a little more when they know where the product came from.",
      "Q: What is your biggest mistake?\nA: Hiring too fast. I hired five staff for a 12-seat café. I had to let two go after three months, and that was painful for everybody.",
    ],
    key_lessons: [
      "Validate a business idea before quitting your job.",
      "Be ready to pivot when the market changes.",
      "A clear value proposition justifies a higher price.",
      "Match your staffing to your actual sales volume.",
    ],
    is_published: true,
  },
  {
    id: "s-3",
    name: "Camille Reyes",
    business_name: "Thrift by Cam",
    business_type: "Online Retail / E-commerce",
    location: "Quezon City, Metro Manila",
    photo_url: photo3,
    short_description:
      "Turned a college side hustle selling thrifted clothes on Facebook into a full-time online shop.",
    biography:
      "Camille Reyes, 24, began reselling ukay-ukay finds on Facebook Live while she was a second-year college student. She now ships around 400 orders a month through Shopee and TikTok Shop with two part-time packers.",
    video_url: "https://www.youtube.com/watch?v=example-camille",
    content: [
      "Q: How did you start with almost no capital?\nA: My first capital was PHP 800. I bought one bundle, washed and photographed the items myself, and sold them on Facebook Live. I only bought more stock after the first batch sold.",
      "Q: How do you handle competition?\nA: There are thousands of online sellers. I compete on presentation and honesty. I disclose every stain and defect in the caption. My return rate is very low because customers know exactly what they are getting.",
      "Q: What about profit?\nA: I pay myself a fixed weekly allowance and keep the rest in a separate business account. Mixing personal and business money is the fastest way to fail.",
      "Q: What skill helped you the most?\nA: Customer service. Answering messages within an hour turned buyers into repeat customers.",
    ],
    key_lessons: [
      "Separate personal money from business money.",
      "Honest product descriptions reduce returns and build trust.",
      "Test demand with a small batch before scaling inventory.",
      "Fast, respectful customer service creates repeat buyers.",
    ],
    is_published: true,
  },
  {
    id: "s-4",
    name: "Ernesto Lim",
    business_name: "Lim Hardware & Construction Supply",
    business_type: "Wholesale / Hardware",
    location: "Iloilo City, Iloilo",
    photo_url: photo4,
    short_description:
      "A 28-year-old family hardware store that survived two typhoons and a failed expansion.",
    biography:
      "Ernesto Lim, 55, took over his father's small hardware stall in 1998. The business now employs 11 people, but it nearly closed in 2013 after an expansion into a second branch drained its cash.",
    video_url: "https://www.youtube.com/watch?v=example-ernesto",
    content: [
      "Q: What was the failed expansion?\nA: In 2012 I opened a second branch using a loan, without studying the location. Foot traffic was low and I was paying rent, salaries, and interest for 14 months. I closed it and paid the loan for three more years.",
      "Q: What did you learn from that?\nA: Growth is not always good. Expand only when the first branch is consistently profitable and you have studied the new market.",
      "Q: How did you survive Typhoon Yolanda's aftermath?\nA: We had an emergency fund equal to three months of expenses. That fund and our supplier relationships allowed us to restock quickly while others were closed.",
      "Q: What do you look for in employees?\nA: Honesty first. In hardware, inventory losses can quietly kill your margin.",
    ],
    key_lessons: [
      "Study the market before expanding to a new location.",
      "Keep an emergency fund of at least three months of expenses.",
      "Debt magnifies both good and bad decisions.",
      "Inventory control directly protects your profit margin.",
    ],
    is_published: true,
  },
  {
    id: "s-5",
    name: "Grace Mendoza",
    business_name: "Halamang Gawa Handmade",
    business_type: "Manufacturing / Handicraft",
    location: "Bacolod City, Negros Occidental",
    photo_url: photo5,
    short_description:
      "Makes handmade soaps and candles from local coconut oil, employing five women in her barangay.",
    biography:
      "Grace Mendoza, 38, started making soap at her kitchen table in 2018 using coconut oil from a nearby farm. She trained five neighbors and now sells to gift shops, hotels, and an export consolidator.",
    video_url: "https://www.youtube.com/watch?v=example-grace",
    content: [
      "Q: How did you find your first customers?\nA: Trade fairs organized by DTI. I applied for a booth, and one hotel buyer I met there is still my biggest client today.",
      "Q: Why do you train your neighbors?\nA: Because I cannot grow alone, and because the business exists in a community. When my neighbors earn, the barangay is safer and my workers stay with me.",
      "Q: What is the hardest part of manufacturing?\nA: Consistency. Every batch must smell and look the same. We wrote down a standard recipe and checklist so anyone can follow it.",
      "Q: What is your goal now?\nA: Getting an FDA license so we can export directly instead of going through a consolidator.",
    ],
    key_lessons: [
      "Government programs and trade fairs are free channels to real buyers.",
      "Standard procedures keep product quality consistent.",
      "Social impact and profit can grow together.",
      "Compliance and licensing open bigger markets.",
    ],
    is_published: true,
  },
];

function q(
  id: string,
  story_id: string,
  question_text: string,
  choices: [string, string, string, string],
  correctIndex: number,
  explanation: string,
): QuizQuestion {
  const labels: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const built = choices.map((text, i) => ({
    id: `${id}-c${i + 1}`,
    label: labels[i]!,
    text,
  }));
  return {
    id,
    story_id,
    question_text,
    choices: built,
    correct_choice_id: built[correctIndex]!.id,
    explanation,
  };
}

export const SEED_QUESTIONS: QuizQuestion[] = [
  q(
    "q-1-1",
    "s-1",
    "What is one important lesson Marilou learned when she started her bakeshop?",
    [
      "Selling at the lowest price always wins customers",
      "She must know her costs before setting a selling price",
      "A business needs a big loan to begin",
      "Advertising is more important than product quality",
    ],
    1,
    "Marilou lost money in her first three months because she did not include gas, flour, and labor in her costing. Correct costing comes before pricing.",
  ),
  q(
    "q-1-2",
    "s-1",
    "How much starting capital did Marilou use for her bakeshop?",
    ["PHP 3,000", "PHP 30,000", "PHP 100,000", "PHP 500"],
    0,
    "She began with PHP 3,000 borrowed from her sister and a borrowed oven.",
  ),
  q(
    "q-1-3",
    "s-1",
    "What did Marilou do with most of her profit during her first two years?",
    [
      "Spent it on household appliances",
      "Kept it all as savings at home",
      "Reinvested it in ovens and a display case",
      "Used it to hire many employees",
    ],
    2,
    "She reinvested profit into equipment, which allowed her to serve larger orders from sari-sari stores.",
  ),
  q(
    "q-1-4",
    "s-1",
    "Why did sari-sari stores begin ordering from Nanay Lou's Bakeshop?",
    [
      "Because she had the cheapest bread in town",
      "Because she was consistent with quality and delivery time",
      "Because she advertised on television",
      "Because she gave unlimited credit",
    ],
    1,
    "Reliability and consistency built the trust that turned one-time buyers into regular wholesale clients.",
  ),
  q(
    "q-1-5",
    "s-1",
    "What simple practice did Marilou recommend to ABM students?",
    [
      "Record your transactions, even in a notebook",
      "Borrow as much capital as possible",
      "Copy the products of successful competitors",
      "Wait for the perfect business idea",
    ],
    0,
    '"If you do not know your numbers, you do not know your business." Record keeping is the foundation of financial management.',
  ),

  q(
    "q-2-1",
    "s-2",
    "How did Jerome reduce the risk of leaving his BPO job?",
    [
      "He resigned immediately and used all his savings",
      "He tested the business on weekends before resigning",
      "He asked his employer for capital",
      "He took a large bank loan first",
    ],
    1,
    "He sold coffee at a Sunday market for two years and only resigned when weekend sales matched half his salary.",
  ),
  q(
    "q-2-2",
    "s-2",
    "How did Kapé Tres respond when dine-in sales collapsed during the pandemic?",
    [
      "It closed permanently",
      "It raised prices for dine-in customers",
      "It pivoted to selling beans and bottled cold brew for delivery",
      "It waited for restrictions to be lifted",
    ],
    2,
    "The pivot to retail products kept the business alive and now contributes about 40% of income.",
  ),
  q(
    "q-2-3",
    "s-2",
    "What is the main value proposition of Kapé Tres?",
    [
      "The lowest coffee price in Baguio",
      "Imported coffee beans from abroad",
      "Direct-trade Benguet beans with the farmer's story",
      "The largest café space in the city",
    ],
    2,
    "Paying farmers directly and telling their story allows the café to charge a premium price.",
  ),
  q(
    "q-2-4",
    "s-2",
    "What hiring mistake did Jerome admit to?",
    [
      "He hired five staff for a 12-seat café",
      "He refused to hire anyone",
      "He hired only family members",
      "He paid below minimum wage",
    ],
    0,
    "Staffing must match actual sales volume; overstaffing forced him to let two employees go.",
  ),
  q(
    "q-2-5",
    "s-2",
    "What business principle does Jerome's weekend market stage demonstrate?",
    [
      "Market validation before full commitment",
      "Vertical integration",
      "Price skimming",
      "Franchising",
    ],
    0,
    "Testing an idea in a small, low-cost way before committing fully is market validation.",
  ),

  q(
    "q-3-1",
    "s-3",
    "What did Camille do before buying more inventory?",
    [
      "She borrowed money from a lender",
      "She waited for her first batch to sell",
      "She rented a physical store",
      "She hired three employees",
    ],
    1,
    "Selling the first bundle before restocking kept her risk and cash requirement low.",
  ),
  q(
    "q-3-2",
    "s-3",
    "Why does Camille disclose stains and defects in her captions?",
    [
      "It is required by law for online sellers",
      "To make her items look cheaper",
      "Honesty lowers returns and builds customer trust",
      "To reduce the number of messages she receives",
    ],
    2,
    "Accurate descriptions set correct expectations, which lowers her return rate and earns repeat buyers.",
  ),
  q(
    "q-3-3",
    "s-3",
    "What financial habit does Camille follow?",
    [
      "She keeps business and personal money in one account",
      "She pays herself a fixed allowance and keeps a separate business account",
      "She spends profit as soon as it arrives",
      "She avoids recording her sales",
    ],
    1,
    "Separating personal and business funds is basic financial discipline for any enterprise.",
  ),
  q(
    "q-3-4",
    "s-3",
    "How much was Camille's first capital?",
    ["PHP 800", "PHP 8,000", "PHP 25,000", "PHP 50,000"],
    0,
    "She started with PHP 800 for one bundle of thrifted clothing.",
  ),
  q(
    "q-3-5",
    "s-3",
    "Which skill did Camille credit for turning buyers into repeat customers?",
    [
      "Graphic design",
      "Accounting",
      "Fast and respectful customer service",
      "Warehouse management",
    ],
    2,
    "Replying to messages within an hour built loyalty in a crowded online market.",
  ),

  q(
    "q-4-1",
    "s-4",
    "Why did Ernesto's second branch fail?",
    [
      "He opened it without studying the location",
      "His products were of poor quality",
      "He had too many employees at the main branch",
      "A competitor copied his prices",
    ],
    0,
    "He expanded using a loan into a low-traffic location without market study, and paid for it for years.",
  ),
  q(
    "q-4-2",
    "s-4",
    "What helped Lim Hardware recover quickly after the typhoon?",
    [
      "A government grant",
      "An emergency fund and strong supplier relationships",
      "Raising prices dramatically",
      "Closing the business temporarily",
    ],
    1,
    "Three months of reserves plus supplier trust allowed fast restocking while competitors were closed.",
  ),
  q(
    "q-4-3",
    "s-4",
    "What does Ernesto say about growth?",
    [
      "Grow as fast as possible using debt",
      "Never expand a family business",
      "Expand only when the first branch is consistently profitable",
      "Growth should always be funded by investors",
    ],
    2,
    "Expansion should follow proven profitability and market research, not ambition alone.",
  ),
  q(
    "q-4-4",
    "s-4",
    "Why is inventory control critical in a hardware business?",
    [
      "It reduces electricity costs",
      "It is required for a business permit",
      "Inventory losses quietly reduce profit margins",
      "It makes the store look organized",
    ],
    2,
    "Unrecorded losses and shrinkage directly erode margins in a low-margin, high-volume business.",
  ),
  q(
    "q-4-5",
    "s-4",
    "What quality does Ernesto look for first in employees?",
    ["Honesty", "Speed", "Sales experience", "College degree"],
    0,
    "Because staff handle stock and cash daily, integrity protects the business more than experience.",
  ),

  q(
    "q-5-1",
    "s-5",
    "Where did Grace meet her biggest long-term client?",
    [
      "On social media",
      "At a DTI trade fair",
      "Through a relative",
      "At a school event",
    ],
    1,
    "Government-organized trade fairs are a low-cost channel to reach serious institutional buyers.",
  ),
  q(
    "q-5-2",
    "s-5",
    "How does Grace keep product quality consistent?",
    [
      "She personally makes every batch",
      "She buys ready-made products",
      "She uses a written standard recipe and checklist",
      "She tests only the first batch of the year",
    ],
    2,
    "Documented standard procedures let any trained worker produce the same result.",
  ),
  q(
    "q-5-3",
    "s-5",
    "Why does Grace train women in her barangay?",
    [
      "To reduce her tax obligations",
      "Because the law requires it",
      "Because she cannot grow alone and the community benefits",
      "To avoid paying wages",
    ],
    2,
    "Her model shows that social impact and business growth can reinforce each other.",
  ),
  q(
    "q-5-4",
    "s-5",
    "What raw material is the base of Grace's products?",
    ["Imported palm oil", "Local coconut oil", "Animal fat", "Synthetic gel"],
    1,
    "She sources coconut oil from a nearby farm, keeping costs and supply local.",
  ),
  q(
    "q-5-5",
    "s-5",
    "Why does Grace want an FDA license?",
    [
      "To export directly instead of using a consolidator",
      "To increase her prices for local buyers",
      "To qualify for a bank loan",
      "To register a trademark",
    ],
    0,
    "Regulatory compliance unlocks larger and more profitable markets.",
  ),
];

export const SEED_BADGES: Badge[] = [
  {
    id: "b-1",
    name: "First Story",
    description: "Completed your first entrepreneur story",
    requirement: "stories_completed >= 1",
    icon: "BookOpen",
  },
  {
    id: "b-2",
    name: "Quiz Rookie",
    description: "Completed your first quiz challenge",
    requirement: "quizzes_completed >= 1",
    icon: "Target",
  },
  {
    id: "b-3",
    name: "Business Explorer",
    description: "Completed 5 entrepreneur stories",
    requirement: "stories_completed >= 5",
    icon: "Compass",
  },
  {
    id: "b-4",
    name: "Quiz Master",
    description: "Scored 90% or higher in a quiz",
    requirement: "best_quiz_score >= 90",
    icon: "Trophy",
  },
  {
    id: "b-5",
    name: "Future Entrepreneur",
    description: "Completed every available entrepreneur story",
    requirement: "stories_completed >= total_stories",
    icon: "Rocket",
  },
];

export const SEED_PROGRESS: StudentProgress[] = [
  {
    student_id: "u-1",
    story_id: "s-1",
    status: "completed",
    last_viewed_at: "2026-07-28T08:10:00.000Z",
  },
  {
    student_id: "u-1",
    story_id: "s-2",
    status: "in_progress",
    last_viewed_at: "2026-08-03T09:40:00.000Z",
  },
  {
    student_id: "u-3",
    story_id: "s-1",
    status: "completed",
    last_viewed_at: "2026-07-20T02:00:00.000Z",
  },
  {
    student_id: "u-3",
    story_id: "s-2",
    status: "completed",
    last_viewed_at: "2026-07-24T02:00:00.000Z",
  },
  {
    student_id: "u-3",
    story_id: "s-3",
    status: "completed",
    last_viewed_at: "2026-07-30T02:00:00.000Z",
  },
];

export const SEED_ATTEMPTS: QuizAttempt[] = [
  {
    id: "a-1",
    student_id: "u-1",
    story_id: "s-1",
    score: 4,
    total_questions: 5,
    xp_earned: 105,
    answers: [],
    completed_at: "2026-07-28T08:30:00.000Z",
  },
  {
    id: "a-2",
    student_id: "u-3",
    story_id: "s-1",
    score: 5,
    total_questions: 5,
    xp_earned: 125,
    answers: [],
    completed_at: "2026-07-20T02:30:00.000Z",
  },
  {
    id: "a-3",
    student_id: "u-3",
    story_id: "s-2",
    score: 4,
    total_questions: 5,
    xp_earned: 105,
    answers: [],
    completed_at: "2026-07-24T02:30:00.000Z",
  },
  {
    id: "a-4",
    student_id: "u-2",
    story_id: "s-1",
    score: 3,
    total_questions: 5,
    xp_earned: 85,
    answers: [],
    completed_at: "2026-08-01T02:30:00.000Z",
  },
];

export const SEED_STUDENT_BADGES: StudentBadge[] = [
  { student_id: "u-1", badge_id: "b-1", earned_at: "2026-07-28T08:30:00.000Z" },
  { student_id: "u-1", badge_id: "b-2", earned_at: "2026-07-28T08:30:00.000Z" },
  { student_id: "u-3", badge_id: "b-1", earned_at: "2026-07-20T02:30:00.000Z" },
  { student_id: "u-3", badge_id: "b-2", earned_at: "2026-07-20T02:30:00.000Z" },
  { student_id: "u-3", badge_id: "b-4", earned_at: "2026-07-20T02:30:00.000Z" },
];

export function levelForXp(xp: number): Level {
  let current = LEVELS[0]!;
  for (const l of LEVELS) if (xp >= l.min_xp) current = l;
  return current;
}

export function nextLevelForXp(xp: number): Level | null {
  return LEVELS.find((l) => l.min_xp > xp) ?? null;
}

export function levelProgress(xp: number): number {
  const current = levelForXp(xp);
  const next = nextLevelForXp(xp);
  if (!next) return 100;
  return Math.round(((xp - current.min_xp) / (next.min_xp - current.min_xp)) * 100);
}
