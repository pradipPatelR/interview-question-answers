import "./App.css";
import Header from "./MyComponents/Header";
import { Footer } from "./MyComponents/Footer";
import { QuestionAnswersList } from "./MyComponents/QuestionAnswersList";
import { AddQuestionAnswer } from "./MyComponents/AddQuestionAnswer";
import { About } from "./MyComponents/About";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

function AppContent({ questionAnswers, filteredQuestionAnswers, onDelete, onUpdate, setQuestionAnswerCallback, searchQuery, onSearch }) {
  const location = useLocation();
  const showSearchBar = location.pathname === "/" && questionAnswers.length > 0;

  return (
    <>
      <Routes>
        <Route path="/" element={
          <main className="app-main">
            <QuestionAnswersList questionAnswers={filteredQuestionAnswers} onDelete={onDelete} onUpdate={onUpdate} searchQuery={searchQuery} />
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
  // Initialize questionAnswers state directly from localStorage
  const [questionAnswers, setQuestionAnswers] = useState(() => {
    const savedQuestionAnswers = localStorage.getItem("questionAnswers");
    if (savedQuestionAnswers) {
      try {
        return JSON.parse(savedQuestionAnswers);
      } catch (error) {
        console.error("Error parsing question answers from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Save questionAnswers to localStorage whenever 'questionAnswers' state updates
  useEffect(() => {
    localStorage.setItem("questionAnswers", JSON.stringify(questionAnswers));
  }, [questionAnswers]);

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
    questionAnswer.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    questionAnswer.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDelete = (questionAnswer) => {
    setQuestionAnswers(questionAnswers.filter((e) => e !== questionAnswer));
  };

  const onUpdate = (sno, updatedTitle, updatedDesc) => {
    setQuestionAnswers(
      questionAnswers.map((questionAnswer) => {
        if (questionAnswer.sno === sno) {
          return { ...questionAnswer, title: updatedTitle, desc: updatedDesc };
        }
        return questionAnswer;
      })
    );
  };

  const setQuestionAnswerCallback = (title, desc) => {
    let sno = questionAnswers.length > 0 ? questionAnswers[questionAnswers.length - 1].sno + 1 : 1;
    const newQuestionAnswer = {
      sno: sno,
      title: title,
      desc: desc,
    };
    setQuestionAnswers([...questionAnswers, newQuestionAnswer]);
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
      />
    </Router>
  );
}

export default App;