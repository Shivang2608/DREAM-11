import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";

import UpcomingMatches from "./pages/UpcomingMatches";
import MyTeams from "./pages/MyTeams";
import PickPlayers from "./pages/PickPlayers";
import PickCaptain from "./pages/PickCaptain";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <UpcomingMatches />
      </Layout>
    )
  },
  {
    path: "/match/:matchId/my-teams",
    element: (
      <Layout>
        <MyTeams />
      </Layout>
    )
  },
  {
    path: "/match/:matchId/create-team",
    element: (
      <Layout>
        <PickPlayers />
      </Layout>
    )
  },
  {
    path: "/match/:matchId/pick-captain",
    element: (
      <Layout>
        <PickCaptain />
      </Layout>
    )
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
