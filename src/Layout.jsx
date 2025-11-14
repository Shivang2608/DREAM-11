import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 md:ml-60">
        <Header />

        <main className="pt-20 p-4 bg-gray-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
