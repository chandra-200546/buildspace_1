import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AIMentorPage } from "./pages/AIMentorPage";
import { AIProjectReviewPage } from "./pages/AIProjectReviewPage";
import { AuthPage } from "./pages/AuthPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { CollaborationHubPage } from "./pages/CollaborationHubPage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { ExplorePage } from "./pages/ExplorePage";
import { LandingPage } from "./pages/LandingPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectTimelinePage } from "./pages/ProjectTimelinePage";
import { RecruiterDashboardPage } from "./pages/RecruiterDashboardPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="*"
        element={
          <AppShell>
            <Routes>
              <Route path="/home" element={<Navigate to="/profile" replace />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/project/:slug" element={<ProjectDetailPage />} />
              <Route path="/create-project" element={<CreateProjectPage />} />
              <Route path="/timeline/:projectId" element={<ProjectTimelinePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/collaborate" element={<CollaborationHubPage />} />
              <Route path="/recruiter" element={<RecruiterDashboardPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/ai-mentor" element={<AIMentorPage />} />
              <Route path="/ai-review" element={<AIProjectReviewPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

export default App;
