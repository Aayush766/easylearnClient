import { useState } from "react";
import { Check, Download, Plus, Trash2, Upload, X } from "lucide-react";
import "./AssessmentQuestionEditor.css";

const TYPES = ["Multiple Choice", "Multiple Select", "True / False", "Descriptive"];
const HEADERS = ["question", "type", "option_a", "option_b", "option_c", "option_d", "correct_answer", "marks", "explanation"];

function makeQuestion(id, type = "Multiple Choice") {
  return { id, text: "", type, marks: 1, options: type === "True / False" ? ["True", "False"] : type === "Descriptive" ? [] : ["", "", "", ""], correctAnswers: [], explanation: "" };
}

function csvRows(source) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  const text = source.replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some((item) => item.trim())) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("There is an unclosed quote. Fix the cell formatting and export the file again as CSV UTF-8.");
  row.push(cell); if (row.some((item) => item.trim())) rows.push(row);
  return rows;
}

function readQuestions(text) {
  const rows = csvRows(text);
  if (rows.length < 2) throw new Error("Include the header row and at least one question row.");
  const headers = rows[0].map((item) => item.trim().toLowerCase());
  const missing = HEADERS.filter((item) => !headers.includes(item));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}. Keep all template header names.`);
  return rows.slice(1).map((values, index) => {
    const record = Object.fromEntries(headers.map((header, column) => [header, (values[column] || "").trim()]));
    const line = index + 2;
    const type = TYPES.find((item) => item.toLowerCase() === record.type.toLowerCase());
    if (!record.question) throw new Error(`Row ${line}: question text is required.`);
    if (!type) throw new Error(`Row ${line}: type must be ${TYPES.join(", ")}.`);
    const marks = Number(record.marks);
    if (!Number.isFinite(marks) || marks < 1) throw new Error(`Row ${line}: marks must be a number greater than zero.`);
    const options = ["option_a", "option_b", "option_c", "option_d"].map((key) => record[key]).filter(Boolean);
    const rawAnswers = record.correct_answer.split("|").map((item) => item.trim()).filter(Boolean);
    let correctAnswers = rawAnswers.map((answer) => {
      if (/^[A-D]$/i.test(answer)) return answer.toUpperCase();
      const match = options.findIndex((option) => option.toLowerCase() === answer.toLowerCase());
      return match < 0 ? "" : String.fromCharCode(65 + match);
    });
    if (type === "True / False") {
      options.splice(0, options.length, "True", "False");
      const answer = record.correct_answer.toLowerCase();
      correctAnswers = [["true", "a"].includes(answer) ? "A" : ["false", "b"].includes(answer) ? "B" : ""];
    } else if (type === "Descriptive") {
      options.splice(0); correctAnswers = [];
    } else if (options.length < 2) throw new Error(`Row ${line}: provide at least two options.`);
    if (type !== "Descriptive" && (!correctAnswers.length || correctAnswers.some((item) => !item))) throw new Error(`Row ${line}: correct_answer must be A, B, C, D or match an option.`);
    if (type !== "Multiple Select" && correctAnswers.length !== 1) throw new Error(`Row ${line}: ${type} needs exactly one correct answer.`);
    if (type === "Multiple Select" && new Set(correctAnswers).size !== correctAnswers.length) throw new Error(`Row ${line}: correct_answer contains a duplicate option.`);
    return { id: Date.now() + index, text: record.question, type, marks, options, correctAnswers, explanation: record.explanation };
  });
}

function downloadTemplate() {
  const lines = [
    HEADERS,
    ["What does HTML stand for?", "Multiple Choice", "HyperText Markup Language", "HighText Machine Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "A", "1", "HTML describes the structure of a web page."],
    ["Which are JavaScript data types?", "Multiple Select", "String", "Boolean", "Browser", "Number", "A|B|D", "2", "Select all valid answers."],
    ["CSS is used to style web pages.", "True / False", "", "", "", "", "TRUE", "1", ""],
    ["Describe a semantic HTML element.", "Descriptive", "", "", "", "", "", "3", "Manually grade this response."],
  ];
  const csv = lines.map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "assessment-questions-template.csv"; anchor.click();
  URL.revokeObjectURL(url);
}

export default function AssessmentQuestionEditor({ questions, onQuestionsChange, defaultType = "Multiple Choice" }) {
  const [showImport, setShowImport] = useState(false);
  const [imported, setImported] = useState([]);
  const [fileName, setFileName] = useState("");
  const [importError, setImportError] = useState("");
  const update = (id, changes) => onQuestionsChange(questions.map((question) => question.id === id ? { ...question, ...changes } : question));
  const changeType = (question, type) => update(question.id, { type, options: type === "True / False" ? ["True", "False"] : type === "Descriptive" ? [] : ["", "", "", ""], correctAnswers: [] });
  const addQuestion = () => onQuestionsChange([...questions, makeQuestion(Date.now(), defaultType)]);
  const selectFile = (file) => {
    setImported([]); setImportError(""); setFileName(file?.name || "");
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) { setImportError("Choose a CSV UTF-8 file. In Excel, use File → Save As → CSV UTF-8 (Comma delimited)."); return; }
    const reader = new FileReader();
    reader.onload = () => { try { setImported(readQuestions(String(reader.result || ""))); } catch (error) { setImportError(error.message); } };
    reader.onerror = () => setImportError("Could not read the selected file. Please try again.");
    reader.readAsText(file);
  };
  const commitImport = () => {
    onQuestionsChange([...questions, ...imported]); setShowImport(false); setImported([]); setFileName(""); setImportError("");
  };
  return (
    <section className="tp-question-editor">
      <h2>Questions <span className="tp-question-actions"><button type="button" className="tp-btn" onClick={() => setShowImport(true)}><Upload size={15} /> Import questions</button><button type="button" className="tp-btn primary" onClick={addQuestion}><Plus size={16} /> Add Question</button></span></h2>
      <p className="tp-question-help">Add answer choices and select the correct answer for automatic grading.</p>
      {questions.map((question, index) => (
        <article className="tp-question-item" key={question.id}>
          <div className="tp-question-item__head"><b>Question {index + 1}</b><button type="button" className="tp-question-delete" aria-label={`Delete question ${index + 1}`} onClick={() => onQuestionsChange(questions.filter((item) => item.id !== question.id))}><Trash2 size={16} /></button></div>
          <label className="tp-question-label">Question text<input value={question.text} placeholder="Type your question" onChange={(event) => update(question.id, { text: event.target.value })} /></label>
          <div className="tp-question-fields"><label className="tp-question-label">Answer format<select value={question.type} onChange={(event) => changeType(question, event.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label><label className="tp-question-label tp-marks-field">Marks<input type="number" min="1" value={question.marks} onChange={(event) => update(question.id, { marks: Number(event.target.value) })} /></label></div>
          {(question.type === "Multiple Choice" || question.type === "Multiple Select") && <fieldset className="tp-answer-options"><legend>Answer choices <small>{question.type === "Multiple Select" ? "Select every correct answer" : "Select the correct answer"}</small></legend>{(question.options || ["", "", "", ""]).map((option, optionIndex) => { const letter = String.fromCharCode(65 + optionIndex); return <label className="tp-answer-option" key={letter}><input type={question.type === "Multiple Select" ? "checkbox" : "radio"} name={`correct-${question.id}`} checked={(question.correctAnswers || []).includes(letter)} onChange={() => update(question.id, { correctAnswers: question.type === "Multiple Select" ? (question.correctAnswers || []).includes(letter) ? question.correctAnswers.filter((answer) => answer !== letter) : [...(question.correctAnswers || []), letter] : [letter] })} /><b>{letter}</b><input value={option} placeholder={`Option ${letter}`} onChange={(event) => update(question.id, { options: (question.options || ["", "", "", ""]).map((value, i) => i === optionIndex ? event.target.value : value) })} /></label>; })}</fieldset>}
          {question.type === "True / False" && <fieldset className="tp-answer-options"><legend>Correct answer</legend>{["True", "False"].map((option, optionIndex) => { const letter = optionIndex === 0 ? "A" : "B"; return <label className="tp-answer-option tp-answer-option--tf" key={option}><input type="radio" name={`correct-${question.id}`} checked={(question.correctAnswers || []).includes(letter)} onChange={() => update(question.id, { correctAnswers: [letter], options: ["True", "False"] })} /><span>{option}</span></label>; })}</fieldset>}
          {question.type === "Descriptive" && <p className="tp-answer-note">Learners type their response. This question needs manual grading.</p>}
          <label className="tp-question-label">Explanation (optional)<textarea value={question.explanation || ""} placeholder="Explain why the answer is correct" onChange={(event) => update(question.id, { explanation: event.target.value })} /></label>
        </article>
      ))}
      {!questions.length && <div className="tp-import-empty">No questions yet. Add one or import a formatted CSV file.</div>}

      {showImport && <div className="tp-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowImport(false); }}><section className="tp-question-import" role="dialog" aria-modal="true" aria-labelledby="tp-import-title"><button type="button" className="tp-question-import__close" aria-label="Close import" onClick={() => setShowImport(false)}><X size={18} /></button><span className="tp-question-import__icon"><Upload size={19} /></span><h2 id="tp-import-title">Import assessment questions</h2><p className="tp-question-import__intro">Prepare your questions in Excel, then save the sheet as <b>CSV UTF-8 (Comma delimited)</b>. Questions will be added to the currently selected course assessment.</p><button type="button" className="tp-btn tp-template-download" onClick={downloadTemplate}><Download size={15} /> Download Excel template</button><div className="tp-import-instructions"><b>Required columns, in this order</b><code>{HEADERS.join(" | ")}</code><ul><li>Use question text and one type: <b>Multiple Choice</b>, <b>Multiple Select</b>, <b>True / False</b>, or <b>Descriptive</b>.</li><li>For choice questions fill option_a to option_d as needed. <b>correct_answer</b> uses A, B, C, D or the exact answer text. Multiple correct answers use <b>A|C</b>.</li><li>For True / False use <b>TRUE</b> or <b>FALSE</b>. Descriptive questions leave options and correct_answer blank; they require manual grading.</li><li>Marks must be a positive number. Explanation is optional. Keep the first header row unchanged; one question per row.</li></ul></div><label className="tp-import-file"><Upload size={17} /><span>{fileName || "Choose a CSV UTF-8 file"}</span><input type="file" accept=".csv,text/csv" onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} /></label>{importError && <p className="tp-import-error" role="alert">{importError}</p>}{imported.length > 0 && <div className="tp-import-preview"><b><Check size={15} /> Ready to import {imported.length} question{imported.length === 1 ? "" : "s"}</b><ol>{imported.slice(0, 4).map((question) => <li key={question.id}>{question.text}<small>{question.type} · {question.marks} mark{question.marks === 1 ? "" : "s"}</small></li>)}</ol>{imported.length > 4 && <small>And {imported.length - 4} more questions</small>}</div>}<div className="tp-question-import__actions"><button type="button" className="tp-btn" onClick={() => setShowImport(false)}>Cancel</button><button type="button" className="tp-btn primary" disabled={!imported.length} onClick={commitImport}>Import {imported.length ? `${imported.length} questions` : "questions"}</button></div></section></div>}
    </section>
  );
}
