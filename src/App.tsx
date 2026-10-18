import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Reader from "./pages/Reader";
import SearchPage from "./pages/Search";
import Bookmarks from "./pages/Bookmarks";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import PlansPage from "./pages/Plans";
import PlanPage from "./pages/Plan";
import DevotionalsPage from "./pages/Devotionals";
import PrayerPage from "./pages/Prayer";
import SyncPage from "./pages/Sync";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read" element={<Reader />} />
          <Route path="/read/:bookId" element={<Reader />} />
          <Route path="/read/:bookId/:chapter" element={<Reader />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plan/:planId" element={<PlanPage />} />
          <Route path="/devotionals" element={<DevotionalsPage />} />
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/sync" element={<SyncPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
