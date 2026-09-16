import React, { useState, useEffect, useRef } from "react";

export const QuestionAnswerItem = ({ questionAnswer, onDelete, onUpdate }) => {
  const deleteModalId = `deleteModal-${questionAnswer.sno || questionAnswer.id || Math.random().toString(36).substr(2, 9)}`;
  const editModalId = `editModal-${questionAnswer.sno || questionAnswer.id || Math.random().toString(36).substr(2, 9)}`;

  const [title, setTitle] = useState(questionAnswer.title);
  const [desc, setDesc] = useState(questionAnswer.desc);

  useEffect(() => {
    setTitle(questionAnswer.title);
    setDesc(questionAnswer.desc);
  }, [questionAnswer]);

  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const recognitionRef = useRef(null);
  const baseValueRef = useRef("");

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

  const startListening = async (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not natively supported in this browser (such as Firefox or Safari). Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Microphone permission error:", err);
      alert("Microphone permission was denied or is unavailable. Please allow microphone access in your browser settings.");
      return;
    }

    if (isListening) {
      stopListening();
    }

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

      const updatedText = baseValueRef.current
        ? `${baseValueRef.current} ${currentTranscript}`
        : currentTranscript;

      if (field === 'title') {
        setTitle(updatedText);
      } else if (field === 'desc') {
        setDesc(updatedText);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert("Microphone access was denied or blocked.");
      }
      stopListening();
    };

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
    onUpdate(questionAnswer.sno, title, desc);
  };

  return (
    <div>
      <div className="card my-3">
        <div className="card-body">
          <div className="row align-items-start">
            <div className="col-md-9">
              <h4>{questionAnswer.title}</h4>
              <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{questionAnswer.desc}</p>
            </div>
            <div className="col-md-3 text-end">
              <button
                className="btn btn-sm btn-primary me-2"
                data-bs-target={`#${editModalId}`}
                data-bs-toggle="modal"
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-danger" 
                data-bs-target={`#${deleteModalId}`} 
                data-bs-toggle="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  <label htmlFor={`edit-title-${questionAnswer.sno}`} className="col-form-label">Title:</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      id={`edit-title-${questionAnswer.sno}`}
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
                      🎤
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor={`edit-desc-${questionAnswer.sno}`} className="col-form-label">Description:</label>
                  <div className="input-group">
                    <textarea 
                      id={`edit-desc-${questionAnswer.sno}`}
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
                      🎤
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