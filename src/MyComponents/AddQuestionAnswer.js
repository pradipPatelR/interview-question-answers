import React, { useState, useRef, useEffect } from 'react'; // Added useEffect here

export const AddQuestionAnswer = (props) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    
    const [isListening, setIsListening] = useState(false);
    const [activeField, setActiveField] = useState(null); // 'title' | 'desc' | null
    
    const recognitionRef = useRef(null);
    const baseValueRef = useRef("");

    // --- ADD THIS USEEFFECT BLOCK ---
    useEffect(() => {
        const modalElement = document.getElementById('addQuestionAnswerModal');
        
        const handleModalHidden = () => {
            // Stop speech recognition if active
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            setIsListening(false);
            setActiveField(null);
            
            // Clear inputs
            setTitle("");
            setDesc("");
        };

        // Listen for Bootstrap's native close event
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
        }

        // Cleanup listener on unmount
        return () => {
            if (modalElement) {
                modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
            }
        };
    }, []);
    // --------------------------------

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setActiveField(null);
    };

    const clearForm = () => {
        stopListening();
        setTitle("");
        setDesc("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') clearForm();
    };

    const startListening = async (field) => {
        // 1. Add all browser vendor prefixes
        const SpeechRecognition = window.SpeechRecognition || 
                                  window.webkitSpeechRecognition || 
                                  window.mozSpeechRecognition || 
                                  window.msSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not natively supported in this browser. Please try using Google Chrome, Edge, or Safari.");
            return;
        }

        // 2. Explicitly ask for microphone permission before starting
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            alert("Microphone permission was denied. Please allow microphone access to use this feature.");
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

            if (field === 'title') setTitle(updatedText);
            else if (field === 'desc') setDesc(updatedText);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
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

    const handleAddQuestionAnswer = () => {
        stopListening();
        props.addQuestionAnswer(title, desc);
        clearForm();
    };

    return (
        <div className="modal fade" id="addQuestionAnswerModal" tabIndex="-1" onKeyDown={handleKeyDown}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">
                            {props.categoryName && props.topicName 
                                ? `Add New Question Answer for ${props.categoryName} in ${props.topicName}` 
                                : "Add New Question Answer"}
                        </h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={clearForm}></button>
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
                                <button type="button" className="btn btn-sm btn-outline-danger bg-white fw-bold" onClick={stopListening}>Stop</button>
                            </div>
                        )}

                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-3">
                                <label htmlFor="question-answer-title" className="col-form-label">Title:</label>
                                <div className="input-group">
                                    <textarea 
                                        id="question-answer-title" className="form-control" rows="2" 
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter or speak title..."
                                    ></textarea>
                                    <button
                                        type="button"
                                        className={`btn ${isListening && activeField === 'title' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => isListening && activeField === 'title' ? stopListening() : startListening('title')}
                                        title="Speak to enter title"
                                    >
                                        <i className="fa fa-microphone"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="question-answer-description" className="col-form-label">Description:</label>
                                <div className="input-group">
                                    <textarea 
                                        id="question-answer-description" className="form-control" rows="3" 
                                        value={desc} onChange={(e) => setDesc(e.target.value)}
                                        placeholder="Enter or speak description..."
                                    ></textarea>
                                    <button
                                        type="button"
                                        className={`btn ${isListening && activeField === 'desc' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => isListening && activeField === 'desc' ? stopListening() : startListening('desc')}
                                        title="Speak to enter description"
                                    >
                                        <i className="fa fa-microphone"></i>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={clearForm}>Close</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" disabled={isInvalid} onClick={handleAddQuestionAnswer}>Add Question Answer</button>
                    </div>
                </div>
            </div>
        </div>
    );
};