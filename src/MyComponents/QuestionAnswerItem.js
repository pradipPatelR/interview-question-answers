import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { supabase } from '../supabaseClient';
import { QuestionAnswerPractice } from "./QuestionAnswerPractice";

export const QuestionAnswerItem = ({ questionAnswer, onDelete, onUpdate, onForceDelete, onToggleDelete, session, questionNumber, topicName, categoryName }) => {
  const isAdmin = session?.user?.user_metadata?.provider_type === 'admin';
  const deleteModalId = `deleteModal-${questionAnswer.id}`;
  const editModalId = `editModal-${questionAnswer.id}`;
  const practiceModalId = `practiceModal-${questionAnswer.id}`;
  const moveModalId = `moveModal-${questionAnswer.id}`;

  const [title, setTitle] = useState(questionAnswer.title);
  const [desc, setDesc] = useState(questionAnswer.desc);

  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    setTitle(questionAnswer.title);
    setDesc(questionAnswer.desc);
    setIsExpanded(false);
  }, [questionAnswer]);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (descRef.current && !isExpanded) {
        const isOverflowing = descRef.current.scrollHeight > descRef.current.clientHeight;
        setHasMore(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [questionAnswer.desc, isExpanded]);

  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const recognitionRef = useRef(null);
  const baseValueRef = useRef("");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    const modalElement = document.getElementById(editModalId);

    const handleModalHidden = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      setActiveField(null);

      setTitle(questionAnswer.title);
      setDesc(questionAnswer.desc);
    };

    if (modalElement) {
      modalElement.addEventListener("hidden.bs.modal", handleModalHidden);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
      }
    };
  }, [editModalId, questionAnswer.title, questionAnswer.desc]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveField(null);
  };

  const handleReset = () => {
    stopListening();
    setTitle(questionAnswer.title);
    setDesc(questionAnswer.desc);
  };

  const stopSpeaking = () => {
    isSpeakingRef.current = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeakToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setIsExpanded(true);

    const titleUtterance = new SpeechSynthesisUtterance(questionAnswer.title);
    const descUtterance = new SpeechSynthesisUtterance(questionAnswer.desc);

    setIsSpeaking(true);
    isSpeakingRef.current = true;

    titleUtterance.onend = () => {
      if (!isSpeakingRef.current) return; 

      speakTimeoutRef.current = setTimeout(() => {
        window.speechSynthesis.speak(descUtterance);
      }, 100);
    };

    titleUtterance.onerror = () => stopSpeaking();
    
    descUtterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };
    
    descUtterance.onerror = () => stopSpeaking();

    window.speechSynthesis.speak(titleUtterance);
  };

  const startListening = async (field) => {
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition || 
                              window.mozSpeechRecognition || 
                              window.msSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not natively supported in this browser. Please try using Google Chrome, Edge, or Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert("Microphone permission was denied. Please allow access in your browser settings.");
      return;
    }

    if (isListening) stopListening();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    baseValueRef.current = field === 'title' ? title : desc;

    recognition.onstart = () => {
      setIsListening(true);
      setActiveField(field);
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const updatedText = baseValueRef.current ? `${baseValueRef.current} ${currentTranscript}` : currentTranscript;
      if (field === 'title') setTitle(updatedText);
      else if (field === 'desc') setDesc(updatedText);
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const isInvalid = title.trim().length === 0 || desc.trim().length === 0;

  const handleUpdate = () => {
    stopListening();
    onUpdate(questionAnswer.id, title, desc);
  };

  const handleMoveModalOpen = async () => {
    stopSpeaking();
    setIsMoving(true);
    const { data: topicsData } = await supabase.from('topics').select('*').order('name');
    if (topicsData) {
      setTopics(topicsData);
      
      // Attempt to find the topic of the current question's category
      const { data: qCat } = await supabase.from('categories').select('topic_id').eq('id', questionAnswer.category_id).single();
      
      const defaultTopic = qCat?.topic_id || (topicsData.length > 0 ? topicsData[0].id : "");
      setSelectedTopicId(defaultTopic);
      
      if (defaultTopic) {
        const { data: catsData } = await supabase.from('categories').select('*').eq('topic_id', defaultTopic).order('name');
        if (catsData) {
          setCategories(catsData);
          setSelectedCategoryId(questionAnswer.category_id || (catsData.length > 0 ? catsData[0].id : ""));
        }
      }
    }
    setIsMoving(false);
  };

  const handleTopicChange = async (e) => {
    const tId = e.target.value;
    setSelectedTopicId(tId);
    setSelectedCategoryId("");
    const { data: catsData } = await supabase.from('categories').select('*').eq('topic_id', tId).order('name');
    if (catsData) {
      setCategories(catsData);
      if (catsData.length > 0) setSelectedCategoryId(catsData[0].id);
    } else {
      setCategories([]);
    }
  };

  const handleMoveQuestion = async () => {
    if (!selectedCategoryId) return;
    setIsMoving(true);
    const { error } = await supabase.from('question_answers').update({ category_id: selectedCategoryId, updated_at: new Date().toISOString() }).eq('id', questionAnswer.id);
    setIsMoving(false);
    if (!error) {
      // we need to tell parent to refetch
      // but wait, if it moved, it should disappear from current list if we're in TopicDetail and category changed.
      // let's just use onUpdate with the same title/desc but trigger refetch? Wait, `onUpdate` doesn't take category_id.
      // But we can trigger refetch! The parent gave `onUpdate` which calls `fetchQuestions()`.
      // Let's call onUpdate with current title/desc to trigger refetch.
      onUpdate(questionAnswer.id, title, desc); 
    } else {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="card my-3 shadow-sm border">
        <div className="card-body p-3 p-md-4">
          <div className="row align-items-start g-3">
            <div className="col-md-8">
              {questionNumber && (
                <span
                  className="badge mb-2 d-inline-block"
                  style={{
                    backgroundColor: 'var(--q-number-color)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Q{questionNumber}
                </span>
              )}
              <h5 className="fw-bold mb-2">{questionAnswer.title}</h5>
              <div>
                <p
                  ref={descRef}
                  className="text-body-secondary mb-0"
                  style={
                    !isExpanded
                      ? {
                          whiteSpace: 'pre-wrap',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }
                      : {
                          whiteSpace: 'pre-wrap',
                        }
                  }
                >
                  {questionAnswer.desc}
                </p>

                {hasMore && (
                  <button
                    className="btn btn-link btn-sm p-0 mt-1 text-decoration-none fw-semibold"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "Read less" : "Read More"}
                  </button>
                )}
                {isAdmin && (questionAnswer.created_at || questionAnswer.updated_at) && (
                  <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                    {questionAnswer.created_at && <div>Created: {new Date(questionAnswer.created_at).toLocaleString('en-US', {
                      month: '2-digit', day: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                    }).replace(',', '')}</div>}
                    {questionAnswer.updated_at && <div>Updated: {new Date(questionAnswer.updated_at).toLocaleString('en-US', {
                      month: '2-digit', day: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                    }).replace(',', '')}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4 text-md-end text-start pt-2 pt-md-0">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start align-items-center">
                {isAdmin && (
                  <div className="form-check form-switch me-2 mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`flexSwitchCheck-${questionAnswer.id}`}
                      checked={!questionAnswer.is_deleted}
                      onChange={() => onToggleDelete(questionAnswer.id, questionAnswer.is_deleted)}
                      title={questionAnswer.is_deleted ? "Currently Deleted" : "Currently Active"}
                    />
                    <label className="form-check-label small text-muted" htmlFor={`flexSwitchCheck-${questionAnswer.id}`}>
                      {questionAnswer.is_deleted ? "Deleted" : "Active"}
                    </label>
                  </div>
                )}
                <button
                  className={`btn btn-sm ${isSpeaking ? 'btn-danger' : 'btn-outline-primary'}`}
                  onClick={handleSpeakToggle}
                  title={isSpeaking ? "Stop" : "Listen"}
                >
                  {isSpeaking ? (
                    <i className="fa fa-stop" style={{ fontSize: '18px' }}></i>
                  ) : (
                    <i className="fa fa-volume-up" style={{ fontSize: '18px' }}></i>
                  )}
                </button>
                
                {isAdmin && (
                  <button
                    className="btn btn-sm btn-info text-white"
                    data-bs-target={`#${moveModalId}`}
                    data-bs-toggle="modal"
                    onClick={handleMoveModalOpen}
                    title="Move Question"
                  >
                    <i className="fa fa-wrench" style={{ fontSize: '18px' }}></i>
                  </button>
                )}

                <button
                  className="btn btn-sm btn-success"
                  data-bs-target={`#${practiceModalId}`}
                  data-bs-toggle="modal"
                  onClick={stopSpeaking}
                  title="Practice"
                >
                  <i className="fa fa-microphone" style={{ fontSize: '18px' }}></i>
                </button>

                <button
                  className="btn btn-sm btn-primary"
                  data-bs-target={`#${editModalId}`}
                  data-bs-toggle="modal"
                  onClick={stopSpeaking}
                  title="Edit"
                >
                  <i className="fa fa-pencil" style={{ fontSize: '18px' }}></i>
                </button>

                <button
                  className="btn btn-sm btn-danger" 
                  data-bs-target={`#${deleteModalId}`} 
                  data-bs-toggle="modal"
                  onClick={stopSpeaking}
                  title={isAdmin ? "Force Delete" : "Delete"}
                >
                  <i className="fa fa-trash" style={{ fontSize: '18px' }}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuestionAnswerPractice 
        questionAnswer={questionAnswer} 
        modalId={practiceModalId}
        questionNumber={questionNumber}
        session={session}
      />

      <div className="modal fade" id={editModalId} tabIndex="-1" aria-labelledby={`${editModalId}Label`} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`${editModalId}Label`}>
                {categoryName && topicName ? `Edit Question / Answer for ${categoryName} in ${topicName}` : "Edit Question / Answer"}
              </h1>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close" 
                onClick={handleReset}
              ></button>
            </div>
            <div className="modal-body">
              {isListening && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3 shadow-sm border-2">
                  <div className="d-flex align-items-center">
                    <span className="spinner-grow spinner-grow-sm text-danger me-2" role="status" aria-hidden="true"></span>
                    <span className="fw-bold">
                      Listening for {activeField === 'title' ? 'Title' : 'Description'}... Speak now!
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger bg-white fw-bold"
                    onClick={stopListening}
                  >
                    Stop
                  </button>
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor={`edit-title-${questionAnswer.id}`} className="col-form-label">Title:</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      id={`edit-title-${questionAnswer.id}`}
                      className="form-control" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                    />
                    <button
                      type="button"
                      className={`btn ${isListening && activeField === 'title' ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => {
                        if (isListening && activeField === 'title') {
                          stopListening();
                        } else {
                          startListening('title');
                        }
                      }}
                      title="Speak to enter title"
                    >
                      <i className="fa fa-microphone"></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor={`edit-desc-${questionAnswer.id}`} className="col-form-label">Description:</label>
                  <div className="input-group">
                    <textarea 
                      id={`edit-desc-${questionAnswer.id}`}
                      className="form-control" 
                      rows="4" 
                      value={desc} 
                      onChange={(e) => setDesc(e.target.value)}
                    ></textarea>
                    <button
                      type="button"
                      className={`btn ${isListening && activeField === 'desc' ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => {
                        if (isListening && activeField === 'desc') {
                          stopListening();
                        } else {
                          startListening('desc');
                        }
                      }}
                      title="Speak to enter description"
                    >
                      <i className="fa fa-microphone"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-bs-dismiss="modal"
                onClick={handleReset}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                data-bs-dismiss="modal"
                disabled={isInvalid}
                onClick={handleUpdate}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="modal fade" id={moveModalId} tabIndex="-1" aria-labelledby={`${moveModalId}Label`} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" id={`${moveModalId}Label`}>Move Question</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {isMoving ? (
                  <div className="text-center my-3"><span className="spinner-border text-primary"></span></div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Topic</label>
                      <select className="form-select" value={selectedTopicId} onChange={handleTopicChange}>
                        {topics.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Category</label>
                      <select 
                        className="form-select" 
                        value={selectedCategoryId} 
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        disabled={categories.length === 0}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      {categories.length === 0 && <small className="text-muted mt-1 d-block">No categories found in this topic.</small>}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  data-bs-dismiss="modal" 
                  onClick={handleMoveQuestion}
                  disabled={!selectedCategoryId || isMoving}
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal fade" id={deleteModalId} aria-labelledby={`${deleteModalId}Label`} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`${deleteModalId}Label`}>Interview Question - {questionAnswer.title}</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to {isAdmin ? "permanently delete" : "delete"} this Interview Question?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => isAdmin ? onForceDelete(questionAnswer.id) : onDelete(questionAnswer)}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};