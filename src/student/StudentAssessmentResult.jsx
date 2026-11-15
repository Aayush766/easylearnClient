import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import StudentLayout from "./StudentLayout";
import api from "../services/api";
import "./StudentAssessmentResult.css";
import "./StudentExperiencePolish.css";
import "./StudentAssessmentInsights.css";

function answerText(question, answer, correct = false) {
  if (!answer) return "Not answered";
  if (question.type === "DESCRIPTIVE") return answer.textResponse || "Not answered";
  const keys = correct
    ? (question.correctOptionKeys?.length ? question.correctOptionKeys : [question.correctOptionKey].filter(Boolean))
    : (answer.selectedOptionKeys?.length ? answer.selectedOptionKeys : [answer.selectedOptionKey].filter(Boolean));
  return keys.map((key) => question.options?.find((option) => option.key === key)?.text || key).join(", ") || "Not answered";
}

export default function StudentAssessmentResult() {
  const { assessmentId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get("/api/attempts", { params: { assessmentId, limit: 100 } })
      .then((result) => {
        const latestAttempt = result?.items?.[0];
        if (!latestAttempt) throw new Error("No submitted attempt was found for this assessment.");
        return api.get(`/api/attempts/${latestAttempt._id}/result`);
      })
      .then((result) => { if (active) setData(result); })
      .catch((loadError) => { if (active) setError(loadError.message || "Could not load this assessment result."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [assessmentId]);

  const questions = useMemo(() => {
    if (!data || data.resultsHidden) return [];
    const answers = new Map((data.attempt?.answers || []).map((answer) => [String(answer.questionId), answer]));
    return (data.questions || []).map((question, index) => {
      const answer = answers.get(String(question._id));
      const manual = question.type === "DESCRIPTIVE";
      const yourAnswer = answerText(question, answer);
      const correctAnswer = answerText(question, answer, true);
      const correctKeys = question.correctOptionKeys?.length ? question.correctOptionKeys : [question.correctOptionKey].filter(Boolean);
      const selectedKeys = answer?.selectedOptionKeys?.length ? answer.selectedOptionKeys : [answer?.selectedOptionKey].filter(Boolean);
      const isCorrect = !manual && selectedKeys.length === correctKeys.length && selectedKeys.every((key) => correctKeys.includes(key));
      return { id: question._id, number: index + 1, question: question.question, yourAnswer, correctAnswer: manual ? "Trainer review required" : correctAnswer, status: manual ? answer?.textResponse ? "Pending review" : "No response" : isCorrect ? "Correct" : "Incorrect", manual, isCorrect };
    });
  }, [data]);

  if (loading) return <StudentLayout><main className="assessment-result-content"><p role="status">Loading assessment result…</p></main></StudentLayout>;
  if (error || !data) return <StudentLayout><main className="assessment-result-content"><p role="alert">{error || "Assessment result not found."}</p><Link to="/student/assessments">Back to assessments</Link></main></StudentLayout>;

  const attempt = data.attempt || {};
  const assessment = data.assessment || {};
  const score = Number(attempt.percentage || 0);
  const attemptedAt = attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "Submitted";
  const resultLabel = attempt.pendingReviewCount ? "Pending trainer review" : attempt.result === "PASS" ? "Passed" : "Not passed";
  const timeTaken = attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s` : "—";

  return <StudentLayout><div className="student-assessment-result"><main className="assessment-result-content assessment-result-real"><Link to="/student/assessments" className="assessment-result-back"><ArrowLeft size={18} />Back to Assessments</Link><header className="assessment-result-heading"><div><h1>{assessment.title || "Assessment result"}</h1><p>{assessment.courseId?.title || "Course"}{assessment.moduleId?.title ? ` · ${assessment.moduleId.title}` : ""}</p><small>Attempted {attemptedAt}</small></div><span className={`assessment-result-status ${attempt.result === "PASS" ? "is-pass" : attempt.result === "FAIL" ? "is-fail" : "is-pending"}`}>{data.resultsHidden ? "Submitted" : resultLabel}</span></header>
    {data.resultsHidden ? <section className="assessment-result-hidden"><CheckCircle2 size={24} /><div><strong>Your attempt was submitted.</strong><span>Results and answer feedback are hidden by your trainer.</span></div></section> : <>
      <section className="assessment-real-summary"><article><span>Your score</span><strong>{score}%</strong><small>{attempt.score ?? 0} / {attempt.totalMarks ?? assessment.totalMarks} marks</small></article><article><span>Passing score</span><strong>{assessment.totalMarks ? Math.round(assessment.passingMarks * 100 / assessment.totalMarks) : 0}%</strong><small>{assessment.passingMarks} marks required</small></article><article><span>Time taken</span><strong>{timeTaken}</strong><small>{questions.length} questions</small></article><article><span>Result</span><strong className={attempt.result === "PASS" ? "is-pass" : attempt.result === "FAIL" ? "is-fail" : "is-pending"}>{resultLabel}</strong><small>{attempt.pendingReviewCount ? `${attempt.pendingReviewCount} written response${attempt.pendingReviewCount === 1 ? "" : "s"} awaiting review` : "Automatically graded"}</small></article></section>
      <section className="assessment-real-questions"><header><div><span>ANSWER REVIEW</span><h2>Questions and feedback</h2></div><p>{attempt.correctCount || 0} correct · {attempt.incorrectCount || 0} incorrect</p></header>{questions.map((question) => <article key={question.id} className={question.manual ? "is-pending" : question.isCorrect ? "is-correct" : "is-incorrect"}><h3>{question.number}. {question.question}</h3><div><small>Your answer</small><p>{question.yourAnswer}</p></div><div><small>{question.manual ? "Review" : "Correct answer"}</small><p>{question.correctAnswer}</p></div><span>{question.status}</span></article>)}{!questions.length && <p>No question details are available for this attempt.</p>}</section>
    </>}
    <footer className="assessment-result-real-footer"><Link to="/student/assessments">Return to assessments</Link></footer></main></div></StudentLayout>;
}
