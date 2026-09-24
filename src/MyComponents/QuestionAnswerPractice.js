import React, { useState, useEffect, useRef } from "react";

export const QuestionAnswerPractice = ({ questionAnswer, modalId, questionNumber, session }) => {
  const isAdmin = session?.user?.user_metadata?.provider_type === 'admin';
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTranscript, setPracticeTranscript] = useState("");
  const [practiceScore, setPracticeScore] = useState(null);
  const [missedWords, setMissedWords] = useState([]);
  
  const [activeChunkIndex, setActiveChunkIndex] = useState(null);
  const [chunkTranscript, setChunkTranscript] = useState("");
  const [chunkResults, setChunkResults] = useState({});

  const practiceRecognitionRef = useRef(null);

  useEffect(() => {
    const practiceModalElement = document.getElementById(modalId);

    const handlePracticeModalHidden = () => {
      if (practiceRecognitionRef.current) {
        practiceRecognitionRef.current.stop();
        practiceRecognitionRef.current = null;
      }
      resetAllStates();
    };

    if (practiceModalElement) {
      practiceModalElement.addEventListener("hidden.bs.modal", handlePracticeModalHidden);
    }

    return () => {
      if (practiceModalElement) {
        practiceModalElement.removeEventListener("hidden.bs.modal", handlePracticeModalHidden);
      }
      if (practiceRecognitionRef.current) {
        practiceRecognitionRef.current.stop();
      }
    };
  }, [modalId]);

  const resetAllStates = () => {
    setIsPracticing(false);
    setPracticeTranscript("");
    setPracticeScore(null);
    setMissedWords([]);
    setActiveChunkIndex(null);
    setChunkTranscript("");
    setChunkResults({});
  };

  const startPractice = async () => {
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition || 
                              window.mozSpeechRecognition || 
                              window.msSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not natively supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert("Microphone permission was denied. Please allow access in your browser settings.");
      return;
    }

    if (practiceRecognitionRef.current) {
      practiceRecognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      resetAllStates();
      setIsPracticing(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setPracticeTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Practice Speech Error:", event.error);
      setIsPracticing(false);
    };

    practiceRecognitionRef.current = recognition;
    recognition.start();
  };

  const stopPracticeAndEvaluate = () => {
    if (practiceRecognitionRef.current) {
      practiceRecognitionRef.current.stop();
      practiceRecognitionRef.current = null;
    }
    setIsPracticing(false);
    evaluatePracticeScore(practiceTranscript, questionAnswer.desc);
  };

  const evaluatePracticeScore = (spokenText, actualAnswer) => {
    const normalize = (str) => (str || "").toLowerCase().replace(/[^\w\s]/gi, "");

    const targetWords = normalize(actualAnswer).split(/\s+/).filter(Boolean);
    const spokenWords = normalize(spokenText).split(/\s+/).filter(Boolean);

    if (targetWords.length === 0) {
      setPracticeScore(spokenWords.length > 0 ? 0 : 100);
      setMissedWords([]);
      return;
    }
    if (spokenWords.length === 0) {
      setPracticeScore(0);
      setMissedWords(targetWords);
      return;
    }

    let matchedCount = 0;
    let spokenCopy = [...spokenWords];
    let missed = [];

    targetWords.forEach((word) => {
      const idx = spokenCopy.indexOf(word);
      if (idx !== -1) {
        matchedCount++;
        spokenCopy.splice(idx, 1);
      } else {
        missed.push(word);
      }
    });

    const percentage = Math.min(100, Math.round((matchedCount / targetWords.length) * 100));
    setPracticeScore(percentage);
    setMissedWords(missed);
  };

  const startChunkPractice = async (index) => {
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition || 
                              window.mozSpeechRecognition || 
                              window.msSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not natively supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert("Microphone permission was denied. Please allow access in your browser settings.");
      return;
    }

    if (practiceRecognitionRef.current) {
      practiceRecognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setActiveChunkIndex(index);
      setChunkTranscript("");
      setChunkResults(prev => {
        const newResults = { ...prev };
        delete newResults[index];
        return newResults;
      });
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setChunkTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Chunk Practice Speech Error:", event.error);
      setActiveChunkIndex(null);
    };

    practiceRecognitionRef.current = recognition;
    recognition.start();
  };

  const stopChunkPracticeAndEvaluate = (index, chunkWords) => {
    if (practiceRecognitionRef.current) {
      practiceRecognitionRef.current.stop();
      practiceRecognitionRef.current = null;
    }
    setActiveChunkIndex(null);

    const normalize = (str) => (str || "").toLowerCase().replace(/[^\w\s]/gi, "");
    const spokenWords = normalize(chunkTranscript).split(/\s+/).filter(Boolean);

    let matchedCount = 0;
    let spokenCopy = [...spokenWords];
    let remainingMissed = [];

    chunkWords.forEach((word) => {
      const idx = spokenCopy.indexOf(word);
      if (idx !== -1) {
        matchedCount++;
        spokenCopy.splice(idx, 1);
      } else {
        remainingMissed.push(word);
      }
    });

    const score = Math.min(100, Math.round((matchedCount / chunkWords.length) * 100));

    setChunkResults(prev => ({
      ...prev,
      [index]: { score, remainingMissed, transcript: chunkTranscript }
    }));
  };

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const missedChunks = chunkArray(missedWords, 10);

  const getScoreDetails = (score) => {
    if (score <= 25) return { label: "Very Low", color: "bg-danger", textColor: "text-danger" };
    if (score <= 50) return { label: "Medium", color: "bg-warning", textColor: "text-warning" };
    if (score <= 75) return { label: "Average", color: "bg-info", textColor: "text-info" };
    if (score <= 99) return { label: "Good", color: "bg-primary", textColor: "text-primary" };
    return { label: "Excellent", color: "bg-success", textColor: "text-success" };
  };

  return (
    <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Speak Practice</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            
            <div className="mb-3">
              <h5 className="fw-bold text-primary">
                {questionNumber ? `Question ${questionNumber}:` : 'Question:'}
              </h5>
              <p className="fs-6 fw-semibold">{questionAnswer.title}</p>
              {isAdmin && (questionAnswer.created_at || questionAnswer.updated_at) && (
                <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
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

            <div className="mb-3">
              <h5 className="fw-bold text-secondary">Expected Answer:</h5>
              <div 
                className="p-3 border rounded bg-body-tertiary" 
                style={{ maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
              >
                {questionAnswer.desc}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Your Spoken Answer:</label>
              <div 
                className="p-3 border rounded bg-body shadow-sm" 
                style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}
              >
                {practiceTranscript ? (
                  <span>{practiceTranscript}</span>
                ) : (
                  <span className="text-muted fst-italic">Click Start Recording to begin practicing...</span>
                )}
              </div>
            </div>

            <div className="text-center mb-3">
              {isPracticing ? (
                <button 
                  className="btn btn-danger btn-lg px-4" 
                  onClick={stopPracticeAndEvaluate}
                >
                  <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                  Stop & Check Accuracy
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-lg px-4" 
                  onClick={startPractice}
                  disabled={activeChunkIndex !== null}
                >
                  <i className="fa fa-microphone"></i> Start Recording
                </button>
              )}
            </div>

            {practiceScore !== null && (
              <div className="mt-4 p-3 border rounded bg-body-tertiary shadow-sm">
                <h5 className="text-center mb-3 fw-bold">Practice Accuracy Result</h5>
                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Accuracy: {practiceScore}%</span>
                  <span className={getScoreDetails(practiceScore).textColor}>
                    {getScoreDetails(practiceScore).label}
                  </span>
                </div>
                <div className="progress" style={{ height: '28px' }}>
                  <div
                    className={`progress-bar progress-bar-striped progress-bar-animated ${getScoreDetails(practiceScore).color}`}
                    role="progressbar"
                    style={{ width: `${practiceScore}%` }}
                    aria-valuenow={practiceScore}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <span className="fs-6 fw-bold">{practiceScore}%</span>
                  </div>
                </div>
              </div>
            )}

            {missedWords.length > 0 && (
              <div className="mt-4 p-3 border rounded border-danger shadow-sm bg-body">
                <h5 className="mb-3 text-danger fw-bold border-bottom pb-2">
                  Mistakes Found: {missedWords.length} Words to Practice
                </h5>
                
                {missedChunks.map((chunk, index) => (
                  <div key={index} className="mb-3 p-3 border rounded bg-body-tertiary shadow-sm">
                    <p className="fw-bold mb-1">Set {index + 1} of {missedChunks.length}</p>
                    <p className="fs-5 text-body" style={{ letterSpacing: '0.5px' }}>
                      {chunk.join(", ")}
                    </p>

                    {chunkResults[index] && (
                      <div className="mb-3 p-2 border rounded bg-body">
                        <div className="small text-muted mb-1">
                          <strong>You said:</strong> {chunkResults[index].transcript || "Nothing"}
                        </div>
                        <div className={`fw-bold mb-1 ${chunkResults[index].score === 100 ? 'text-success' : 'text-warning'}`}>
                          Score: {chunkResults[index].score}%
                        </div>
                        {chunkResults[index].remainingMissed.length > 0 && (
                          <div className="small text-danger">
                            <strong>Still missed:</strong> {chunkResults[index].remainingMissed.join(", ")}
                          </div>
                        )}
                      </div>
                    )}

                    {activeChunkIndex === index ? (
                      <div className="mt-2 p-2 border border-danger rounded bg-body">
                        <p className="text-danger fw-bold mb-2">
                          <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                          Listening: {chunkTranscript}
                        </p>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => stopChunkPracticeAndEvaluate(index, chunk)}
                        >
                          Stop & Check Set
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-sm btn-outline-danger mt-1" 
                        onClick={() => startChunkPractice(index)}
                        disabled={isPracticing || (activeChunkIndex !== null && activeChunkIndex !== index)}
                      >
                        <i className="fa fa-microphone"></i> Practice {chunk.length} words
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};