import "./App.css";
import Header from "./MyComponents/Header";
import { Footer } from "./MyComponents/Footer";
import { TopicsList } from "./MyComponents/TopicsList";
import { TopicDetail } from "./MyComponents/TopicDetail";
import { About } from "./MyComponents/About";
import { Home } from "./MyComponents/Home"; 
import { LoginRegisterModal } from "./MyComponents/LoginRegisterModal";
import EditProfileModal from "./MyComponents/EditProfileModal";
import { ResetPassword } from "./MyComponents/ResetPassword";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

function AppContent({
  questionAnswers,
  onDelete,
  onUpdate,
  onForceDelete,
  onToggleDelete,
  setQuestionAnswerCallback,
  searchQuery,
  onSearch,
  loading,
  theme,
  setTheme,
  currentPage,
  itemsPerPage,
  totalCount,
  setCurrentPage,
  setItemsPerPage,
  session,
  setActiveCategoryId
}) {
  const location = useLocation();
  const isOnQuestionsPage = location.pathname.startsWith("/questions");
  const isResetPasswordPage = location.pathname === "/reset-password";

  return (
    <>
      <Header
        title="Interview Questions Answers"
        searchBar={isOnQuestionsPage}
        searchQuery={searchQuery}
        onSearch={onSearch}
        theme={theme}
        onThemeChange={setTheme}
        minimal={isResetPasswordPage}
        session={session}
      />

      <Routes>
        <Route path="/" element={
          <main className="app-main pt-5">
            <Home />
          </main>
        } />

        <Route path="/questions" element={
          <main className="app-main pt-5">
            <TopicsList session={session} />
          </main>
        } />

        <Route path="/questions/:topicId" element={
          <main className="app-main pt-5">
            <TopicDetail 
              session={session}
              onCategorySelect={(catId) => {
                 setActiveCategoryId(catId);
                 setCurrentPage(1);
              }}
              questionAnswers={questionAnswers}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onForceDelete={onForceDelete}
              onToggleDelete={onToggleDelete}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalCount={totalCount}
              setCurrentPage={setCurrentPage}
              setItemsPerPage={setItemsPerPage}
              loading={loading}
              addQuestionAnswer={setQuestionAnswerCallback}
            />
          </main>
        } />

        <Route path="/about" element={
          <main className="app-main pt-5">
            <About />
          </main>
        } />
        <Route path="/reset-password" element={
          <main className="app-main pt-5">
            <ResetPassword />
          </main>
        } />
      </Routes>

      <LoginRegisterModal />
      <EditProfileModal session={session} />
      {!isResetPasswordPage && <Footer session={session} />}
    </>
  );
}

function App() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const [session, setSession] = useState(null);

  // Server-side Pagination & Search States
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [activeCategoryId, setActiveCategoryId] = useState(null);

  // Track Live Supabase Auth Session State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply Light / Dark / System mode theme globally
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      if (theme === "system") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-bs-theme", systemDark ? "dark" : "light");
      } else {
        root.setAttribute("data-bs-theme", theme);
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [theme]);

  const fetchQuestions = async () => {
    if (!activeCategoryId) return;
    setLoading(true);
    
    let query = supabase
      .from('question_answers')
      .select('*', { count: 'exact' })
      .eq('category_id', activeCategoryId);

    const isAdmin = session?.user?.user_metadata?.provider_type === 'admin';
    if (!isAdmin) {
      query = query.eq('is_deleted', false);
    }

    if (appliedSearchQuery.trim() !== "") {
      query = query.or(`title.ilike.%${appliedSearchQuery}%,desc.ilike.%${appliedSearchQuery}%`);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.order('id', { ascending: true }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching questions:", error.message);
    } else {
      setQuestionAnswers(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, appliedSearchQuery, session, activeCategoryId]);

  const handleSearch = (query) => {
    setAppliedSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleSearch("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setQuestionAnswerCallback = async (title, desc) => {
    if (!activeCategoryId) {
       alert("Please select a Topic and Category first.");
       return;
    }
    const { error } = await supabase
      .from('question_answers')
      .insert([{ title, desc, category_id: activeCategoryId }]);

    if (error) {
      console.error("Error inserting question:", error.message);
    } else {
      fetchQuestions();
    }
  };

  const onDelete = async (questionAnswer) => {
    const { error } = await supabase
      .from('question_answers')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', questionAnswer.id);

    if (error) {
      console.error("Error updating soft delete status:", error.message);
    } else {
      fetchQuestions();
    }
  };

  const onForceDelete = async (id) => {
    const { error } = await supabase
      .from('question_answers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error force deleting question:", error.message);
    } else {
      fetchQuestions();
    }
  };

  const onToggleDelete = async (id, currentStatus) => {
    const { error } = await supabase
      .from('question_answers')
      .update({ is_deleted: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error toggling delete status:", error.message);
    } else {
      fetchQuestions();
    }
  };

  const onUpdate = async (id, updatedTitle, updatedDesc) => {
    const { error } = await supabase
      .from('question_answers')
      .update({ title: updatedTitle, desc: updatedDesc, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error updating question:", error.message);
    } else {
      fetchQuestions();
    }
  };

  return (
    <Router>
      <AppContent
        questionAnswers={questionAnswers}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onForceDelete={onForceDelete}
        onToggleDelete={onToggleDelete}
        setQuestionAnswerCallback={setQuestionAnswerCallback}
        searchQuery={appliedSearchQuery}
        onSearch={handleSearch}
        loading={loading}
        theme={theme}
        setTheme={setTheme}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalCount={totalCount}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        session={session}
        setActiveCategoryId={setActiveCategoryId}
      />
    </Router>
  );
}

export default App;