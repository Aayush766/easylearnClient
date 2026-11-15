import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Database,
  FileText,
  HelpCircle,
  Menu,
  Timer,
  X,
} from "lucide-react";

import "./StudentAssessmentTest.css";
import "./StudentAssessmentStart.css";
import api from "../services/api";

const QUESTIONS = [
  {
    id: 1,
    question: "Which of the following is used to style a web page?",
    type: "Multiple Choice",
    options: [
      { id: "A", text: "HTML" },
      { id: "B", text: "CSS" },
      { id: "C", text: "JavaScript" },
      { id: "D", text: "Python" },
    ],
    correctAnswer: "B",
    explanation:
      "CSS (Cascading Style Sheets) is used to style and design web pages, including layout, colors, fonts, and spacing.",
  },
  {
    id: 2,
    question: "Which HTML element is used to create a hyperlink?",
    type: "Multiple Choice",
    options: [
      { id: "A", text: "<link>" },
      { id: "B", text: "<a>" },
      { id: "C", text: "<href>" },
      { id: "D", text: "<url>" },
    ],
    correctAnswer: "B",
    explanation:
      "The <a> element is used to create hyperlinks in HTML.",
  },
  {
    id: 3,
    question: "Which language is primarily used to add interactivity to web pages?",
    type: "Multiple Choice",
    options: [
      { id: "A", text: "CSS" },
      { id: "B", text: "HTML" },
      { id: "C", text: "JavaScript" },
      { id: "D", text: "SQL" },
    ],
    correctAnswer: "C",
    explanation:
      "JavaScript is commonly used to add dynamic behavior and interactivity to web pages.",
  },
  {
    id: 4,
    question: "Which CSS property changes the text color?",
    type: "Multiple Choice",
    options: [
      { id: "A", text: "font-color" },
      { id: "B", text: "text-color" },
      { id: "C", text: "color" },
      { id: "D", text: "foreground" },
    ],
    correctAnswer: "C",
    explanation:
      "The CSS color property is used to define the foreground text color.",
  },
  {
    id: 5,
    question: "Which keyword declares a constant in modern JavaScript?",
    type: "Multiple Choice",
    options: [
      { id: "A", text: "constant" },
      { id: "B", text: "const" },
      { id: "C", text: "static" },
      { id: "D", text: "fixed" },
    ],
    correctAnswer: "B",
    explanation:
      "The const keyword declares a block-scoped variable whose binding cannot be reassigned.",
  },
  ...Array.from({ length: 15 }, (_, index) => ({
    id: index + 6,
    question: `Sample assessment question ${index + 6}: Which concept is important in modern web development?`,
    type: "Multiple Choice",
    options: [
      { id: "A", text: "Responsive Design" },
      { id: "B", text: "Accessibility" },
      { id: "C", text: "Performance" },
      { id: "D", text: "All of the above" },
    ],
    correctAnswer: "D",
    explanation:
      "Responsive design, accessibility, and performance are all important aspects of modern web development.",
  })),
];

const INITIAL_TIME = 30 * 60;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function AssessmentLogo() {
  return (
    <div className="test-logo">
      <img
        src="/assets/student/logo.jpeg"
        alt="Prime Easy Learn Training Institute"
      />
    </div>
  );
}

function TestHeader({
  courseName,
  timeRemaining,
  onEndTest,
  onMobileMenu,
}) {
  return (
    <header className="test-header">
      <AssessmentLogo />

      <div className="test-header__course">
        <button
          type="button"
          className="test-header__back"
          onClick={onMobileMenu}
          aria-label="Back"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="test-header__course-icon">
          <Database size={23} />
        </div>

        <div className="test-header__course-info">
          <strong>{courseName}</strong>
          <span>Assessment Test</span>
        </div>
      </div>

      <div className="test-header__actions">
        <div className="test-header__timer">
          <Clock3 size={19} />
          <span>{formatTime(timeRemaining)}</span>
        </div>

        <button
          type="button"
          className="test-header__end"
          onClick={onEndTest}
        >
          End Test
        </button>

        <button
          type="button"
          className="test-header__notification"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span />
        </button>

        <div className="test-header__profile">
          <img
            src="/assets/student/avatar.png"
            alt="Aayush Kumar"
          />

          <div>
            <strong>Aayush Kumar</strong>
            <span>Student</span>
          </div>

          <ChevronLeft size={18} className="test-header__profile-chevron" />
        </div>
      </div>
    </header>
  );
}

function TestInformation({ questionCount, timeMinutes }) {
  return (
    <div className="test-information">
      <div className="test-information__back">
        <ArrowLeft size={16} />
        <span>Back to Course</span>
      </div>

      <h1>Pre Assessment</h1>

      <p>
        Test your current knowledge before starting the course.
      </p>

      <div className="test-information__stats">
        <div>
          <FileText size={18} />
          <span>{questionCount} Questions</span>
        </div>

        <div>
          <Clock3 size={18} />
          <span>{timeMinutes} Minutes</span>
        </div>

        <div>
          <FileText size={18} />
          <span>Multiple Choice</span>
        </div>

        <div>
          <CheckCircle2 size={18} />
          <span>Auto Saved</span>
        </div>
      </div>
    </div>
  );
}

function QuestionPalette({
  questions,
  currentQuestion,
  answers,
  markedQuestions,
  onSelect,
}) {
  return (
    <section className="question-palette">
      <h2>Question Palette</h2>

      <div className="palette-legend">
        <div>
          <span className="legend-dot legend-dot--answered" />
          Answered
        </div>

        <div>
          <span className="legend-dot legend-dot--unanswered" />
          Not Answered
        </div>

        <div>
          <span className="legend-dot legend-dot--current" />
          Current
        </div>

        <div>
          <Bookmark size={16} />
          Marked
        </div>
      </div>

      <div className="question-grid">
        {questions.map((question) => {
          const isCurrent = question.id === currentQuestion;
          const isAnswered = Boolean(answers[question.id]);
          const isMarked = markedQuestions.includes(question.id);

          let stateClass = "";

          if (isCurrent) {
            stateClass = "question-number--current";
          } else if (isAnswered) {
            stateClass = "question-number--answered";
          } else {
            stateClass = "question-number--unanswered";
          }

          return (
            <button
              type="button"
              key={question.id}
              className={`question-number ${stateClass}`}
              onClick={() => onSelect(question.id)}
              aria-label={`Question ${question.id}`}
            >
              {question.id}

              {isMarked && (
                <Bookmark
                  size={9}
                  className="question-number__bookmark"
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TimerCard({ timeRemaining }) {
  const progress = Math.max(
    0,
    Math.min(100, (timeRemaining / INITIAL_TIME) * 100)
  );

  return (
    <section className="timer-card">
      <div className="timer-card__header">
        <Timer size={29} />
        <h2>Time Remaining</h2>
      </div>

      <div className="timer-card__body">
        <div>
          <strong>{formatTime(timeRemaining)}</strong>

          <div className="timer-card__labels">
            <span>Minutes</span>
            <span>Seconds</span>
          </div>
        </div>

        <div
          className="timer-ring"
          style={{
            background: `conic-gradient(
              #0878ef ${progress}%,
              #d9e1ec ${progress}% 100%
            )`,
          }}
        >
          <div className="timer-ring__inner" />
        </div>
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  selectedAnswer,
  marked,
  onAnswer,
  onToggleMark,
}) {
  const answered = Array.isArray(selectedAnswer) ? selectedAnswer.length > 0 : Boolean(selectedAnswer);
  const multipleSelect = question.type === "Multiple Select";
  const descriptive = question.type === "Descriptive";

  return (
    <section className="question-card">
      <div className="question-card__top">
        <span className="question-type">{question.type}</span>

        <button
          type="button"
          className={`mark-button ${
            marked ? "mark-button--active" : ""
          }`}
          onClick={onToggleMark}
        >
          <Bookmark
            size={18}
            fill={marked ? "currentColor" : "none"}
          />
          {marked ? "Marked" : "Mark for Review"}
        </button>
      </div>

      <h2>{question.question}</h2>

      {descriptive ? <label className="assessment-answer-text-label">Your response<textarea value={selectedAnswer || ""} maxLength={5000} onChange={(event) => onAnswer(event.target.value)} placeholder="Write your response" /></label> : <div className="answer-options">
        {(question.options || []).map((option) => {
          const selected = multipleSelect ? (selectedAnswer || []).includes(option.id) : selectedAnswer === option.id;

          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={selected}
              className={`answer-option ${
                selected ? "answer-option--selected" : ""
              }`}
              onClick={() => onAnswer(option.id)}
            >
              <span className={multipleSelect ? "answer-option__checkbox" : "answer-option__radio"}>
                {selected && <span />}
              </span>

              <span className="answer-option__letter">
                {option.id}
              </span>

              <span className="answer-option__text">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>}

      {answered && (
        <div className="answer-feedback">
          <div className="answer-feedback__icon">
            <Check size={20} />
          </div>

          <div>
            <strong>Answer Saved</strong>
            <p>
              Your answer has been automatically saved. You can change
              your answer before submitting the assessment.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function HelpCard() {
  return (
    <section className="test-help">
      <div className="test-help__icon">
        <HelpCircle size={27} />
      </div>

      <div>
        <h2>Need Help?</h2>

        <p>
          If you face any issues during the test, contact our support
          team.
        </p>

        <button type="button">Contact Support</button>
      </div>
    </section>
  );
}

function TestFooter() {
  return (
    <footer className="test-footer">
      <span>
        Â© 2025 Prime Easy Learn Training Institute. All rights reserved.
      </span>

      <div>
        <a href="#privacy">Privacy Policy</a>
        <span>|</span>
        <a href="#terms">Terms &amp; Conditions</a>
        <span>|</span>
        <a href="#help">Help</a>
      </div>

      <div className="test-footer__quote">
        Learn Today
        <br />
        Lead Tomorrow
      </div>
    </footer>
  );
}

function EndTestModal({ onCancel, onConfirm }) {
  return (
    <div className="test-modal-backdrop">
      <div className="test-modal">
        <button
          type="button"
          className="test-modal__close"
          onClick={onCancel}
        >
          <X size={19} />
        </button>

        <div className="test-modal__icon">
          <Clock3 size={25} />
        </div>

        <h2>End Assessment?</h2>

        <p>
          Are you sure you want to end this assessment? Your current
          progress will be submitted.
        </p>

        <div className="test-modal__actions">
          <button type="button" onClick={onCancel}>
            Continue Test
          </button>

          <button
            type="button"
            className="test-modal__confirm"
            onClick={onConfirm}
          >
            End Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentAssessmentTest() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [attemptId, setAttemptId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const [showEndModal, setShowEndModal] = useState(false);
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [focusNotice, setFocusNotice] = useState("");
  const [focusWarnings, setFocusWarnings] = useState(0);
  const testPageRef = useRef(null);
  const cameraPreviewRef = useRef(null);
  const autoSubmitStarted = useRef(false);
  const endTestRef = useRef(null);

  useEffect(() => {
    let active = true;
    api.get(`/api/assessments/${assessmentId}`).then((result) => {
      if (!active) return;
      const record = result?.assessment || {};
      setAssessment(record);
      setTimeRemaining(Math.max(60, Number(record.durationMinutes || 30) * 60));
      setQuestions((result?.questions || []).map((item, index) => ({ id: index + 1, serverId: item._id, question: item.question, type: ({ MCQ: "Multiple Choice", MULTI_SELECT: "Multiple Select", TRUE_FALSE: "True / False", DESCRIPTIVE: "Descriptive" })[item.type] || item.type, options: (item.options || []).map((option) => ({ id: option.key, text: option.text })), correctAnswer: null, explanation: "" }))); if (!(result?.questions || []).length) setLoadError("This assessment has no questions yet.");
    }).catch((error) => { if (active) { setQuestions([]); setLoadError(error.message); } });
    return () => { active = false; };
  }, [assessmentId]);

  useEffect(() => {
    if (cameraPreviewRef.current && cameraStream) cameraPreviewRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  useEffect(() => () => cameraStream?.getTracks().forEach((track) => track.stop()), [cameraStream]);

  const question = useMemo(() => questions.find((item) => item.id === currentQuestion) || questions[0], [currentQuestion, questions]);

  useEffect(() => {
    if (!testStarted) return undefined;
    const timer = window.setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [testStarted]);

  useEffect(() => {
    if (!testStarted) return undefined;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setFocusWarnings((count) => count + 1);
        setFocusNotice("Leaving the test tab has been recorded. Return to the assessment to continue.");
      }
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement) setFocusNotice("Full screen was exited. Return to full screen to continue your assessment.");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [testStarted]);

  const requestCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser. Try a recent version of Chrome, Edge, or Firefox.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
    } catch (error) {
      setCameraError(error.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, then try again." : "We couldn't start your camera. Check that it is connected and not in use by another app.");
    }
  };

  const beginTest = async () => {
    if (!acceptedInstructions || !cameraStream || !questions.length) return;
    try {
      const result = await api.post(`/api/assessments/${assessmentId}/start`);
      setAttemptId(result?.attempt?._id || result?.attempt?.id || ""); const durationSeconds = Math.max(60, Number(assessment?.durationMinutes || 30) * 60); const startedAt = new Date(result?.attempt?.startedAt || Date.now()).getTime(); setTimeRemaining(Math.max(0, durationSeconds - Math.floor((Date.now() - startedAt) / 1000)));
    } catch (error) { setLoadError(error.message); return; }
    try {
      await testPageRef.current?.requestFullscreen?.();
    } catch {
      setFocusNotice("Full-screen permission was unavailable. The test will continue in this window.");
    }
    setTestStarted(true);
  };

  useEffect(() => {
    if (!attemptId || !questions.length) return;
    const timeout = window.setTimeout(() => {
      const saved = questions.filter((item) => Array.isArray(answers[item.id]) ? answers[item.id].length : Boolean(answers[item.id])).map((item) => ({ questionId: item.serverId, selectedOptionKey: typeof answers[item.id] === "string" && item.type !== "Descriptive" ? answers[item.id] : undefined, selectedOptionKeys: Array.isArray(answers[item.id]) ? answers[item.id] : undefined, textResponse: item.type === "Descriptive" ? answers[item.id] : undefined, markedForReview: markedQuestions.includes(item.id) }));
      api.put(`/api/attempts/${attemptId}/answers`, { answers: saved }).catch((error) => setLoadError(error.message));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [attemptId, answers, markedQuestions, questions]);

  const answeredCount = questions.filter((item) => Array.isArray(answers[item.id]) ? answers[item.id].length > 0 : Boolean(answers[item.id])).length;

  const selectAnswer = (answer) => {
    setAnswers((previous) => {
      if (question.type === "Multiple Select") {
        const selected = previous[currentQuestion] || [];
        return { ...previous, [currentQuestion]: selected.includes(answer) ? selected.filter((item) => item !== answer) : [...selected, answer] };
      }
      return { ...previous, [currentQuestion]: answer };
    });
  };

  const toggleMark = () => {
    setMarkedQuestions((previous) =>
      previous.includes(currentQuestion)
        ? previous.filter((id) => id !== currentQuestion)
        : [...previous, currentQuestion]
    );
  };

  const goToQuestion = (id) => {
    setCurrentQuestion(id);
  };

  const nextQuestion = () => {
    setCurrentQuestion((current) =>
      Math.min(questions.length, current + 1)
    );
  };

  const previousQuestion = () => {
    setCurrentQuestion((current) => Math.max(1, current - 1));
  };

  const endTest = async () => {
    setShowEndModal(false);
    if (!attemptId) { setLoadError("Your assessment attempt has not started. Please reopen the assessment."); return; }
    const saved = questions.filter((item) => Array.isArray(answers[item.id]) ? answers[item.id].length : Boolean(answers[item.id])).map((item) => ({ questionId: item.serverId, selectedOptionKey: typeof answers[item.id] === "string" && item.type !== "Descriptive" ? answers[item.id] : undefined, selectedOptionKeys: Array.isArray(answers[item.id]) ? answers[item.id] : undefined, textResponse: item.type === "Descriptive" ? answers[item.id] : undefined, markedForReview: markedQuestions.includes(item.id) }));
    let attempt;
    try {
      try { await api.put(`/api/attempts/${attemptId}/answers`, { answers: saved }); } catch (error) { if (error.code !== "TIME_LIMIT_EXCEEDED") throw error; }
      const response = await api.post(`/api/attempts/${attemptId}/submit`);
      attempt = response?.attempt || {};
    } catch (error) { setLoadError(error.message || "Your assessment could not be submitted."); return; }
    const result = {
      score: attempt.percentage ?? 0,
      hideResults: Boolean(attempt.resultsHidden),
      correct: attempt.correctCount ?? 0,
      incorrect: attempt.incorrectCount ?? 0,
      pendingReview: attempt.pendingReviewCount ?? 0,
      notAttempted: Math.max(0, questions.length - (attempt.correctCount ?? 0) - (attempt.incorrectCount ?? 0) - (attempt.pendingReviewCount ?? 0)),
      questions: questions.length,
      submittedAt: attempt.submittedAt || new Date().toISOString(),
      questionsData: questions.map((item) => ({
        id: item.id,
        question: item.question,
        yourAnswer: item.type === "Descriptive" ? answers[item.id] || "Not attempted" : (Array.isArray(answers[item.id]) ? answers[item.id] : [answers[item.id]]).filter(Boolean).map((answer) => item.options.find((option) => option.id === answer)?.text).filter(Boolean).join(", ") || "Not attempted",
        correctAnswer: "Graded by the assessment service",
        status: !answers[item.id] ? "unanswered" : "submitted",
        time: "â€”",
      })),
    };
    localStorage.setItem(`assessment-${assessmentId}-result`, JSON.stringify(result));
    cameraStream?.getTracks().forEach((track) => track.stop());
    if (document.fullscreenElement) document.exitFullscreen?.();
    navigate(`/student/assessments/${assessmentId}/result`, { state: { result } });
  };

  endTestRef.current = endTest;
  useEffect(() => { if (testStarted && timeRemaining === 0 && !autoSubmitStarted.current) { autoSubmitStarted.current = true; void endTestRef.current?.(); } }, [testStarted, timeRemaining]);

  const progressPercentage =
    (currentQuestion / Math.max(1, questions.length)) * 100;

  if (!testStarted) {
    return (
      <div className="assessment-start-page">
        <main className="assessment-start-card">
          <div className="assessment-start-icon"><FileText size={27} /></div>
          <span className="assessment-start-kicker">BEFORE YOU BEGIN</span>
          <h1>Assessment instructions</h1>
          <p className="assessment-start-intro">Take a moment to prepare. Your answers are saved as you go.</p>{loadError && <p className="assessment-camera-error" role="alert">{loadError}</p>}
          <div className="assessment-instruction-list">
            <div><span>01</span><p><strong>Time limit</strong><small>You have {assessment?.durationMinutes || 30} minutes for {questions.length} questions. The timer starts after you enter the test.</small></p></div>
            <div><span>02</span><p><strong>One question at a time</strong><small>Use the question navigator to move around and mark questions to review.</small></p></div>
            <div><span>03</span><p><strong>Stay in the assessment</strong><small>Weâ€™ll request full screen and flag tab changes while the test is active. Your browser cannot prevent switching tabs.</small></p></div>
            <div><span>04</span><p><strong>Camera check</strong><small>Camera access is requested only after you accept these instructions. Video is previewed locally and is not recorded.</small></p></div>
          </div>
          <label className="assessment-instructions-accept"><input type="checkbox" checked={acceptedInstructions} onChange={(event) => setAcceptedInstructions(event.target.checked)} /><span>I have read the instructions and am ready to continue.</span></label>
          {cameraStream && <div className="assessment-camera-preview"><video ref={cameraPreviewRef} autoPlay muted playsInline /><span><i /> Camera ready</span></div>}
          {cameraError && <p className="assessment-camera-error" role="alert">{cameraError}</p>}
          <div className="assessment-start-actions">
            {!cameraStream ? (
              <button type="button" className="assessment-start-primary" disabled={!acceptedInstructions || Boolean(loadError) || !questions.length} onClick={requestCamera}><CheckCircle2 size={17} /> Accept &amp; allow camera</button>
            ) : (
              <button type="button" className="assessment-start-primary" disabled={!acceptedInstructions || Boolean(loadError) || !questions.length} onClick={beginTest}><CheckCircle2 size={17} /> Enter full-screen test</button>
            )}
            <button type="button" className="assessment-start-secondary" onClick={() => navigate("/student/assessments")}><ArrowLeft size={16} /> Back to assessments</button>
          </div>
          <small className="assessment-start-footnote">Camera permission is controlled by your browser. The demo does not record or upload video.</small>
        </main>
      </div>
    );
  }

  return (
    <div className="assessment-test-page" ref={testPageRef}>
      {focusNotice && <div className="assessment-focus-notice" role="status"><span>{focusNotice}{focusWarnings > 1 ? ` (${focusWarnings} tab changes)` : ""}</span><button type="button" onClick={() => setFocusNotice("")} aria-label="Dismiss focus warning"><X size={16} /></button></div>}
      <TestHeader
        courseName={assessment?.title || "Assessment"}
        timeRemaining={timeRemaining}
        onEndTest={() => setShowEndModal(true)}
        onMobileMenu={() => navigate("/student/assessments")}
      />

      <div className="test-workspace">
        <aside className="test-left-sidebar">
          <TestInformation
              questionCount={questions.length}
            timeMinutes={assessment?.durationMinutes || 30}
          />

          <QuestionPalette
            questions={questions}
            currentQuestion={currentQuestion}
            answers={answers}
            markedQuestions={markedQuestions}
            onSelect={goToQuestion}
          />

          <div className="test-status-legend">
            <div>
              <span className="status-dot status-dot--current" />
              Current Question
            </div>

            <div>
              <span className="status-dot status-dot--unanswered" />
              Not Answered
            </div>

            <div>
              <span className="status-dot status-dot--answered" />
              Answered
            </div>

            <div>
              <Bookmark size={18} />
              Marked for Review
            </div>
          </div>
        </aside>

        <main className="test-main">
          <div className="test-progress-header">
            <div>
              Question {currentQuestion} of {questions.length}
            </div>

            <div className="test-progress-value">
              {Math.round(progressPercentage)}% Completed
            </div>

            <div className="test-progress-track">
              <span
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          <QuestionCard
            question={question}
            selectedAnswer={answers[currentQuestion]}
            marked={markedQuestions.includes(currentQuestion)}
            onAnswer={selectAnswer}
            onToggleMark={toggleMark}
          />

          <div className="test-navigation">
            <button
              type="button"
              className="test-navigation__previous"
              disabled={currentQuestion === 1}
              onClick={previousQuestion}
            >
              <ChevronLeft size={19} />
              Previous
            </button>

            <div className="test-navigation__saved">
              <CheckCircle2 size={15} />
              {answeredCount} of {questions.length} Answered
            </div>

            <button
              type="button"
              className="test-navigation__next"
              disabled={currentQuestion === questions.length}
              onClick={nextQuestion}
            >
              Next Question
              <ArrowRight size={18} />
            </button>
          </div>
        </main>

        <aside className="test-right-sidebar">
          <TimerCard timeRemaining={timeRemaining} />

          <QuestionPalette
            questions={questions}
            currentQuestion={currentQuestion}
            answers={answers}
            markedQuestions={markedQuestions}
            onSelect={goToQuestion}
          />

          <HelpCard />
        </aside>
      </div>

      <TestFooter />

      {showEndModal && (
        <EndTestModal
          onCancel={() => setShowEndModal(false)}
          onConfirm={endTest}
        />
      )}
    </div>
  );
}



