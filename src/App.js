import "./App.css";
import Header from "./MyComponents/Header";
import { Footer } from "./MyComponents/Footer";
import { QuestionAnswersList } from "./MyComponents/QuestionAnswersList";
import { AddQuestionAnswer } from "./MyComponents/AddQuestionAnswer";
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
  session
}) {
  const location = useLocation();
  const isOnQuestionsPage = location.pathname === "/questions";
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
            {loading ? (
              <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <QuestionAnswersList 
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
                session={session}
              />
            )}
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

      <AddQuestionAnswer addQuestionAnswer={setQuestionAnswerCallback} />
      <LoginRegisterModal />
      <EditProfileModal session={session} />
      {!isResetPasswordPage && <Footer />}
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
    setLoading(true);
    
    let query = supabase
      .from('question_answers')
      .select('*', { count: 'exact' });

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
  }, [currentPage, itemsPerPage, appliedSearchQuery, session]);

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
    const { error } = await supabase
      .from('question_answers')
      .insert([{ title, desc }]);

    if (error) {
      console.error("Error inserting question:", error.message);
    } else {
      fetchQuestions();
    }
  };

  const onDelete = async (questionAnswer) => {
    const { error } = await supabase
      .from('question_answers')
      .update({ is_deleted: true })
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
      .update({ is_deleted: !currentStatus })
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
      .update({ title: updatedTitle, desc: updatedDesc })
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
      />
    </Router>
  );
}

export default App;