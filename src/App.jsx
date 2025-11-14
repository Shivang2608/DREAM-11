import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UpcomingMatches from "./pages/UpcomingMatches";
import MyTeams from "./pages/MyTeams";
import PickPlayers from "./pages/PickPlayers";
import PickCaptain from "./pages/PickCaptain";

const router = createBrowserRouter([
  { path: "/", element: <UpcomingMatches /> },
  { path: "/match/:matchId/my-teams", element: <MyTeams /> },
  { path: "/match/:matchId/create-team", element: <PickPlayers /> },
  { path: "/match/:matchId/pick-captain", element: <PickCaptain /> },
]);

function App() {
  return (
    // We use a pure black background for the app container
    <div className="max-w-lg mx-auto  overflow-y-auto shadow-2xl shadow-crimson/20">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;