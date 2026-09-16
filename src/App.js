import "./App.css";
import Header from "./MyComponents/Header";
import { Footer } from "./MyComponents/Footer";
import { QuestionAnswersList } from "./MyComponents/QuestionAnswersList";
import { AddQuestionAnswer } from "./MyComponents/AddQuestionAnswer";
import { About } from "./MyComponents/About";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

function AppContent({ questionAnswers, filteredQuestionAnswers, onDelete, onUpdate, setQuestionAnswerCallback, searchQuery, onSearch, loading }) {
  const location = useLocation();
  const showSearchBar = location.pathname === "/" && questionAnswers.length > 0;

  return (
    <>
      <Routes>
        <Route path="/" element={
          <main className="app-main">
            {loading ? (
              <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <QuestionAnswersList questionAnswers={filteredQuestionAnswers} onDelete={onDelete} onUpdate={onUpdate} searchQuery={searchQuery} />
            )}
          </main>
        } />

        <Route path="/about" element={
          <main className="app-main">
            <About />
          </main>
        } />
      </Routes>

      <Header
        title="Interview Questions Answers"
        searchBar={showSearchBar}
        searchQuery={searchQuery}
        onSearch={onSearch}
      />
      <AddQuestionAnswer addQuestionAnswer={setQuestionAnswerCallback} />
      <Footer />
    </>
  );
}

function App() {
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch only active (non-deleted) questions from Supabase
  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('question_answers')
      .select('*')
      .eq('is_deleted', false)
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error.message);
    } else {
      setQuestionAnswers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Search Escape Key functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredQuestionAnswers = questionAnswers.filter((questionAnswer) =>
    (questionAnswer.title || "").toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    (questionAnswer.desc || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CREATE: Add new item to Supabase
  const setQuestionAnswerCallback = async (title, desc) => {
    const { data, error } = await supabase
      .from('question_answers')
      .insert([{ title, desc }])
      .select();

    if (error) {
      console.error("Error inserting question:", error.message);
    } else if (data) {
      setQuestionAnswers((prev) => [...prev, ...data]);
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
      setQuestionAnswers((prev) => prev.filter((item) => item.id !== questionAnswer.id));
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
      setQuestionAnswers((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: updatedTitle, desc: updatedDesc } : item
        )
      );
    }
  };

  return (
    <Router>
      <AppContent
        questionAnswers={questionAnswers}
        filteredQuestionAnswers={filteredQuestionAnswers}
        onDelete={onDelete}
        onUpdate={onUpdate}
        setQuestionAnswerCallback={setQuestionAnswerCallback}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loading}
      />
    </Router>
  );
}

export default App;