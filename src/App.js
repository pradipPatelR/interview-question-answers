import "./App.css";
import Header from "./MyComponents/Header";
import { Footer } from "./MyComponents/Footer";
import { QuestionAnswersList } from "./MyComponents/QuestionAnswersList";
import { AddQuestionAnswer } from "./MyComponents/AddQuestionAnswer";
import { About } from "./MyComponents/About";
import { Home } from "./MyComponents/Home"; // Imported new Home component
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

function AppContent({
  questionAnswers,
  onDelete,
  onUpdate,
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
  setItemsPerPage
}) {
  const location = useLocation();
  // Check if user is currently on the Questions tab
  const isOnQuestionsPage = location.pathname === "/questions";

  return (
    <>
      <Header
        title="Interview Questions Answers"
        searchBar={isOnQuestionsPage} // Only show search on Questions tab
        showAddQA={isOnQuestionsPage} // Only show Add Q/A on Questions tab
        searchQuery={searchQuery}
        onSearch={onSearch}
        theme={theme}
        onThemeChange={setTheme}
      />

      <Routes>
        {/* New Welcome Home Page */}
        <Route path="/" element={
          <main className="app-main pt-5">
            <Home />
          </main>
        } />

        {/* Moved Questions List to /questions */}
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
                searchQuery={searchQuery}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalCount={totalCount}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
              />
            )}
          </main>
        } />

        <Route path="/about" element={
          <main className="app-main pt-5">
            <About />
          </main>
        } />
      </Routes>

      <AddQuestionAnswer addQuestionAnswer={setQuestionAnswerCallback} />
      <Footer />
    </>
  );
}

function App() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  
  // Server-side Pagination & Search States
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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

  // Fetch paginated and searched questions from Supabase
  const fetchQuestions = async () => {
    setLoading(true);
    
    let query = supabase
      .from('question_answers')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    // Apply search filter if present
    if (appliedSearchQuery.trim() !== "") {
      query = query.or(`title.ilike.%${appliedSearchQuery}%,desc.ilike.%${appliedSearchQuery}%`);
    }

    // Apply pagination
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
  }, [currentPage, itemsPerPage, appliedSearchQuery]);

  const handleSearch = (query) => {
    setAppliedSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Search Escape Key functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleSearch("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // CREATE: Add new item to Supabase
  const setQuestionAnswerCallback = async (title, desc) => {
    const { error } = await supabase
      .from('question_answers')
      .insert([{ title, desc }]);

    if (error) {
      console.error("Error inserting question:", error.message);
    } else {
      fetchQuestions(); // Refresh list to get updated count and pagination
    }
  };

  // SOFT DELETE: Flag item as deleted instead of deleting from table
  const onDelete = async (questionAnswer) => {
    const { error } = await supabase
      .from('question_answers')
      .update({ is_deleted: true })
      .eq('id', questionAnswer.id);

    if (error) {
      console.error("Error updating soft delete status:", error.message);
    } else {
      fetchQuestions(); // Refresh to reflect deletion in current page view
    }
  };

  // UPDATE: Edit item in Supabase
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
      />
    </Router>
  );
}

export default App;