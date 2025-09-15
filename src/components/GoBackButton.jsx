import { useNavigate } from "react-router-dom";

export default function GoBackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg shadow text-gray-800 font-medium"
    >
      ← Voltar
    </button>
  );
}
