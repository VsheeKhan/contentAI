import LogoutButton from "../components/logout-button";
import PersonaSurvey from "../components/persona-survey";

export default function SurveyPage() {
  return (
    <div className="relative h-screen w-full bg-gray-100">
      <LogoutButton className="fixed top-1 md:top-4 right-1 md:right-4 z-50" />
      <PersonaSurvey editPersona={false} />
    </div>
  );
}
