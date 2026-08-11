# BizCraft Academy

Build a complete responsive web application called "BizCraft".

PROJECT CONTEXT:

BizCraft is a gamified educational web application designed for Grade 11 and Grade 12 ABM students. Its purpose is to expose students to real-life entrepreneur stories and improve their interest, knowledge, and aspirations toward entrepreneurship through interactive learning and game-based activities.

IMPORTANT DESIGN DIRECTION:

The interface must look like a real school/thesis web application designed in Figma by college students. Do NOT make it look like an AI-generated startup website.

Use:

- Clean white/light-gray backgrounds

- Purple as the main accent color

- Orange as a secondary accent color

- Simple cards

- Moderate rounded corners

- Subtle shadows

- Simple icons

- Poppins or Inter font

- Plenty of whitespace

- Simple navigation

- No excessive gradients

- No glassmorphism

- No futuristic effects

- No excessive 3D illustrations

- No overly decorative animations

The design should be practical and easy to implement.

USER ROLES:

1. Student

2. Administrator

STUDENT FEATURES:

1. LOGIN PAGE

Create a simple login page containing:

- BizCraft logo/name

- Email/Username field

- Password field

- Login button

- Forgot password link

- Register option

2. STUDENT DASHBOARD

After logging in, show:

- "Welcome back, [Student Name]!"

- Current Entrepreneur Level

- XP points

- Progress bar

- Stories completed

- Quizzes completed

- Badges earned

Include a "Continue Learning" section showing the entrepreneur story the student was last viewing.

Include "Entrepreneur Stories" cards with:

- Entrepreneur photo

- Entrepreneur name

- Business type

- Short description

- Progress

- "View Story" button

Use realistic placeholder data, but make it easy for the administrator to replace it later.

3. ENTREPRENEUR STORIES

Create a page where students can browse entrepreneur stories.

Each story should contain:

- Entrepreneur photo

- Name

- Business

- Location

- Short biography

- Video placeholder

- Story/interview content

- Key lessons

- "Start Challenge" button

The stories should be presented as real educational content rather than entertainment articles.

4. BASKETBALL QUIZ GAME

This is one of the MAIN FEATURES of BizCraft.

After reading/watching an entrepreneur story, the student can start a basketball-themed quiz.

Create an actual interactive game interface.

Game layout:

- Question at the top

- Question number, e.g. "Question 2 of 5"

- Score

- XP

- Progress bar

- Basketball court-inspired background

- Basketball hoop

- Four answer choices represented as basketballs or basketball-themed answer buttons

Example:

Question:

"What is one important lesson that the entrepreneur learned when starting the business?"

Answer choices:

A

B

C

D

GAME MECHANIC:

The student selects an answer and attempts a basketball shot.

If the answer is correct:

- Show a successful basketball shot animation

- Show "Correct!"

- Add XP

- Add score

- Continue to the next question

If the answer is incorrect:

- Show a missed shot animation

- Show "Incorrect"

- Explain the correct answer

- Allow the student to continue

Keep the game simple enough to actually function in a web browser. Do not create an overly complicated 3D basketball game.

Use CSS/JavaScript animations for the basketball movement and hoop interaction.

5. QUIZ RESULTS

After completing a quiz, show:

- Final score

- Correct answers

- Incorrect answers

- XP earned

- Badge earned, if applicable

- Short performance message

- "Review Answers"

- "Next Story"

- "Back to Dashboard"

6. XP AND LEVEL SYSTEM

Create a simple progression system.

Example:

Level 1 - Entrepreneur Beginner

Level 2 - Business Explorer

Level 3 - Aspiring Entrepreneur

Level 4 - Business Builder

Level 5 - Future Entrepreneur

Students gain XP from:

- Completing stories

- Completing quizzes

- Answering questions correctly

- Completing challenges

Display XP progress throughout the dashboard.

7. ACHIEVEMENTS / BADGES

Create an Achievements page.

Example badges:

- First Story - Completed your first entrepreneur story

- Quiz Rookie - Completed your first quiz

- Business Explorer - Completed 5 stories

- Quiz Master - Achieved 90% or higher

- Future Entrepreneur - Completed all available stories

Show locked and unlocked badges.

8. STUDENT PROFILE

Show:

- Student name

- Profile picture placeholder

- Grade level

- Section

- Entrepreneur level

- XP

- Stories completed

- Quizzes completed

- Average quiz score

- Earned badges

ADMIN FEATURES:

Create a separate Admin login/dashboard.

ADMIN DASHBOARD:

Show:

- Total students

- Total entrepreneur stories

- Total quizzes

- Total completed quizzes

- Average quiz score

- Most completed stories

ADMIN CAN MANAGE:

1. Students

- View students

- Search students

- View student progress

- View XP and achievements

2. Entrepreneur Stories

- Add story

- Edit story

- Delete story

- Upload entrepreneur image

- Add video URL

- Add biography

- Add key lessons

3. Quiz Questions

- Add question

- Select correct answer

- Add four choices

- Add explanation

- Assign question to an entrepreneur story

4. Badges

- Create badges

- Set badge requirements

- Edit/delete badges

DATABASE:

Use a proper relational database structure.

Suggested tables:

- users

- student_profiles

- entrepreneur_stories

- quiz_questions

- quiz_choices

- quiz_attempts

- quiz_answers

- badges

- student_badges

- student_progress

Make the application architecture ready for a real backend/database.

NAVIGATION:

Student sidebar:

- Dashboard

- Entrepreneur Stories

- Challenges

- Achievements

- Profile

- Logout

Admin sidebar:

- Dashboard

- Students

- Entrepreneur Stories

- Quiz Questions

- Badges

- Reports

- Logout

RESPONSIVE DESIGN:

The application should work on:

- Desktop

- Laptop

- Tablet

- Mobile

However, prioritize the desktop/laptop experience because this will primarily be demonstrated as a school web application.

IMPORTANT:

Do NOT create one huge dashboard containing every feature.

Each feature should have its own page.

The main user flow should be:

Login

→ Student Dashboard

→ Choose Entrepreneur Story

→ Watch/Read Story

→ Key Lessons

→ Start Challenge

→ Basketball Quiz

→ Quiz Results

→ Earn XP/Badge

→ Return to Dashboard

→ Continue to next Entrepreneur Story

Make the application functional with realistic sample data.

Use clear buttons and navigation.

Keep the visual design consistent throughout the entire application.

The most important features to prioritize are:

1. Student login

2. Dashboard

3. Entrepreneur stories

4. Basketball quiz game

5. Quiz scoring

6. XP and levels

7. Badges

8. Admin management

Build the MVP first and make sure the core student flow actually works before adding unnecessary visual effects.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bizcraft.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/575c4153-518c-4156-89b0-7a6e510eb9c6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
