🔖 Garner: Collect Your Favorites with Ease

Garner is a high-performance, full-stack web application designed for seamless bookmark management. Built with Next.js 16 and Supabase, it features secure Google OAuth authentication and a responsive dashboard for managing your digital favorites.

🚀 Live Demo
View the Production Site

🛠️ Tech Stack
Framework: Next.js 16 (App Router & Turbopack)

Authentication: Supabase SSR with Google OAuth

Database: Supabase PostgreSQL

Styling: Bootstrap 5

Deployment: Vercel (Continuous Integration/Continuous Deployment)

⚙️ Project Setup & Deployment
To deploy this project yourself, follow these steps:

1. Environment Variables
   Create a .env.local file in the root directory and add your Supabase credentials:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key 2. Supabase Configuration
Site URL: Set to https://your-app.vercel.app in Authentication > URL Configuration.

Redirect URIs: Add https://your-app.vercel.app/callback to the allow-list.

3. Google OAuth Setup
   In Google Cloud Console, add your Supabase callback URL to the Authorized Redirect URIs: https://<project-id>.supabase.co/auth/v1/callback.

🏗️ Local Development
Bash

# Install dependencies

npm install

# Run the development server

npm run dev
Open http://localhost:3000 to see the result.

📓 Challange log

Challenge 1: Git Repository Integrity and Large File Management
Problem: The deployment process was initially obstructed by a bloated repository containing local build artifacts and cache directories, which exceeded GitHub’s file size constraints.

Resolution: I conducted a manual audit of the repository, surgically removing non-essential directories such as .next, node_modules, and local cache files. I then implemented a rigorous .gitignore file to ensure only source code was tracked.

Insight: Maintaining a lean repository is critical for CI/CD efficiency; automated deployment pipelines depend on the exclusion of environment-specific build artifacts.

Challenge 2: Cross-Origin Authentication and Production Redirects
Problem: Authentication handshakes were failing in the production environment because the system was defaulting to localhost even when accessed via the Vercel domain.

Resolution: I refactored the authentication logic to utilize dynamic origin detection through ${window.location.origin}. Furthermore, I synchronized the Supabase Site URL and Google OAuth Redirect URIs to prioritize the https://garner-seven.vercel.app production endpoint.

Insight: Production environments require strict alignment between the application's internal redirect logic and the security configurations of external Identity Providers (IdPs).

Challenge 3: State Management in Next.js 16 Server Components
Problem: Following a successful OAuth callback, users were incorrectly redirected to the login screen because the server-side middleware failed to recognize the newly created session cookie.

Resolution: I updated the app/callback/route.ts to utilize the asynchronous await cookies() pattern required by the Next.js 16 runtime. This ensured that the session was fully persisted before the final redirect to the dashboard occurred.

Insight: Adopting modern framework patterns is essential for session persistence and ensuring that middleware correctly intercepts and validates secure routes.
