import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireAuth from "./components/RequireAuth";

import { LandingPage, LoginPage, NotFoundPage } from "./pages";
import StudentDashboard from "./student/StudentDashboard";
import StudentCourses from "./student/StudentCourses";
import StudentCourseCatalog from "./student/StudentCourseCatalog";
import StudentCourseLearning from "./student/StudentCourseLearning";
import StudentFeaturePage from "./student/StudentFeaturePage";
import StudentAssessments from "./student/StudentAssessments";
import StudentAssessmentTest from "./student/StudentAssessmentTest";
import StudentAssessmentResult from "./student/StudentAssessmentResult";
import StudentCertificates from "./student/StudentCertificates";
import StudentProgress from "./student/StudentProgress";
import StudentAttendance from "./student/StudentAttendance";
import StudentMessages from "./student/StudentMessages";
import StudentSupport from "./student/StudentSupport";
import StudentProfile from "./student/StudentProfile";
import TrainerDashboard from "./trainer/TrainerDashboard";
import TrainerActivityPage from "./trainer/TrainerActivityPage";
import TrainerAttendance from "./trainer/TrainerAttendance";
import TrainerMessages from "./trainer/TrainerMessages";
import { Assessments, Courses, Profile, Results, Support, UploadPage } from "./trainer/TrainerPages";
import CertificateTemplates from "./admin/CertificateTemplates";
import { BrandingProvider } from "./context/BrandingContext";

function App() {
  return (
    <AuthProvider><BrowserRouter><BrandingProvider>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login/:portal" element={<LoginPage />} />
        <Route path="/admin/certificate-templates" element={<RequireAuth roles={["ADMIN", "SUPER_ADMIN"]}><CertificateTemplates /></RequireAuth>} />

        {/* ================= STUDENT ================= */}
     <Route path="/student" element={<RequireAuth roles={["LEARNER"]}><StudentDashboard /></RequireAuth>} />

<Route
  path="/student/assessments"
  element={<RequireAuth roles={["LEARNER"]}><StudentAssessments /></RequireAuth>}
/>

<Route
  path="/student/assessments/:assessmentId/result"
  element={<RequireAuth roles={["LEARNER"]}><StudentAssessmentResult /></RequireAuth>}
/>

<Route
  path="/student/assessments/:assessmentId"
  element={<RequireAuth roles={["LEARNER"]}><StudentAssessmentTest /></RequireAuth>}
/>

<Route path="/student/courses" element={<RequireAuth roles={["LEARNER"]}><StudentCourses /></RequireAuth>} />
<Route path="/student/courses/catalog" element={<RequireAuth roles={["LEARNER"]}><StudentCourseCatalog /></RequireAuth>} />

<Route path="/student/courses/:id" element={<RequireAuth roles={["LEARNER"]}><StudentCourseLearning /></RequireAuth>} />

<Route
  path="/student/certificates"
  element={<RequireAuth roles={["LEARNER"]}><StudentCertificates /></RequireAuth>}
/>

<Route
  path="/student/progress"
  element={<RequireAuth roles={["LEARNER"]}><StudentProgress /></RequireAuth>}
/>
<Route path="/student/attendance" element={<RequireAuth roles={["LEARNER"]}><StudentAttendance /></RequireAuth>} />

<Route
  path="/student/messages"
  element={<RequireAuth roles={["LEARNER"]}><StudentMessages /></RequireAuth>}
/>

<Route
  path="/student/support"
  element={<RequireAuth roles={["LEARNER"]}><StudentSupport /></RequireAuth>}
/>

<Route path="/student/profile" element={<RequireAuth roles={["LEARNER"]}><StudentProfile /></RequireAuth>} />

<Route
  path="/student/:page"
  element={<RequireAuth roles={["LEARNER"]}><StudentFeaturePage /></RequireAuth>}
/>

        {/* ================= TRAINER ================= */}
        <Route path="/trainer" element={<RequireAuth roles={["TRAINER"]}><TrainerDashboard /></RequireAuth>} />
        <Route path="/trainer/activity" element={<RequireAuth roles={["TRAINER"]}><TrainerActivityPage /></RequireAuth>} />
        <Route path="/trainer/attendance" element={<RequireAuth roles={["TRAINER"]}><TrainerAttendance /></RequireAuth>} />
        <Route path="/trainer/courses" element={<RequireAuth roles={["TRAINER"]}><Courses /></RequireAuth>} />
        <Route path="/trainer/content" element={<RequireAuth roles={["TRAINER"]}><Courses /></RequireAuth>} />
        <Route path="/trainer/upload" element={<RequireAuth roles={["TRAINER"]}><UploadPage /></RequireAuth>} />
        <Route path="/trainer/assessments" element={<RequireAuth roles={["TRAINER"]}><Assessments /></RequireAuth>} />
        <Route path="/trainer/messages" element={<RequireAuth roles={["TRAINER"]}><TrainerMessages /></RequireAuth>} />
        <Route path="/trainer/results" element={<RequireAuth roles={["TRAINER"]}><Results /></RequireAuth>} />
        <Route path="/trainer/profile" element={<RequireAuth roles={["TRAINER"]}><Profile /></RequireAuth>} />
        <Route path="/trainer/support" element={<RequireAuth roles={["TRAINER"]}><Support /></RequireAuth>} />

        {/* Old login route */}
        <Route
          path="/login"
          element={<Navigate replace to="/" />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrandingProvider></BrowserRouter></AuthProvider>
  );
}

export default App;
