import { Link } from "react-router-dom";
import { Home, Calendar, Users, Gift } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r h-screen hidden md:flex flex-col p-5 fixed left-0 top-0">

      <h1 className="text-xl font-bold mb-8">Dream-11 UI</h1>

      <nav className="space-y-4">
        <Link to="/" className="flex items-center gap-3 text-black hover:text-red-500">
          <Home size={20} /> Home
        </Link>

        <Link to="/" className="flex items-center gap-3 text-black hover:text-red-500">
          <Calendar size={20} /> Upcoming Matches
        </Link>

        <Link to="/" className="flex items-center gap-3 text-black hover:text-red-500">
          <Users size={20} /> My Teams
        </Link>

        <Link to="/" className="flex items-center gap-3 text-black hover:text-red-500">
          <Gift size={20} /> Refer & Earn
        </Link>
      </nav>

    </aside>
  );
}
