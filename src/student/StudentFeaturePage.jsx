import { useParams } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import FeaturePage from "../pages/FeaturePage";
import StudentBookmarks from "./StudentBookmarks";

export default function StudentFeaturePage() {
  const { page, id } = useParams();

  if (page === "bookmarks") return <StudentBookmarks />;

  return (
    <StudentLayout>
      <FeaturePage id={id} page={page} role="student" />
    </StudentLayout>
  );
}
