# Google OAuth Setup in Supabase for Campus Guardian

Follow these steps to configure Google authentication using Supabase.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project** and name it `Campus Guardian`.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - Fill in the App name, User support email, and Developer contact information.
   - Click **Save and Continue** through the scopes and test users steps.
   - Publish the app to production to avoid login restrictions.

## 2. Create OAuth Client Credentials
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Set the Application type to **Web application**.
4. In the **Authorized JavaScript origins** section, add your local and production URLs:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
5. In the **Authorized redirect URIs** section, add the redirect URI from your Supabase Project:
   - `https://moppuikcjqbqkppanvfj.supabase.co/auth/v1/callback`
6. Click **Create** and copy the generated **Client ID** and **Client Secret**.

## 3. Configure Supabase Auth Provider
1. Go to your [Supabase Dashboard](https://supabase.com/).
2. Select your project `Campus Guardian` (`moppuikcjqbqkppanvfj`).
3. Go to **Authentication** > **Providers** > **Google**.
4. Toggle Google to **Enabled**.
5. Paste the **Client ID** and **Client Secret** copied from Google Cloud Console.
6. Click **Save**.

## 4. Environment Configuration
Ensure your frontend and backend configuration directories have the corresponding environment variables:
- **Frontend** (`.env`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Backend** (`.env`):
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
