import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { QuestionAnswerPractice } from "./QuestionAnswerPractice";

export const QuestionAnswerItem = ({ questionAnswer, onDelete, onUpdate }) => {
  const deleteModalId = `deleteModal-${questionAnswer.id}`;
  const editModalId = `editModal-${questionAnswer.id}`;
  const practiceModalId = `practiceModal-${questionAnswer.id}`;

  const [title, setTitle] = useState(questionAnswer.title);
  const [desc, setDesc] = useState(questionAnswer.desc);

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not natively supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert("Microphone permission was denied.");
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

  return (
    <div>
      <div className="card my-3 shadow-sm border">
        <div className="card-body p-3 p-md-4">
          <div className="row align-items-start g-3">
            <div className="col-md-8">
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
              </div>
            </div>

            <div className="col-md-4 text-md-end text-start pt-2 pt-md-0">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end justify-content-start">
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
                  title="Delete"
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
      />

      <div className="modal fade" id={editModalId} tabIndex="-1" aria-labelledby={`${editModalId}Label`} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`${editModalId}Label`}>Edit Question / Answer</h1>
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

      <div className="modal fade" id={deleteModalId} aria-labelledby={`${deleteModalId}Label`} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`${deleteModalId}Label`}>Interview Question - {questionAnswer.title}</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this Interview Question?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => onDelete(questionAnswer)}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};