import { useState, useEffect } from "react";
import GoBackButton from "../components/GoBackButton";

export default function SettingsPage() {
  const electronAPI = window.electronAPI;
  const isElectron = Boolean(electronAPI?.getStorageSettings);

  const [customSqlitePath, setCustomSqlitePath] = useState("");
  const [customUploadsDir, setCustomUploadsDir] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadSettings = async () => {
    if (!isElectron) {
      setLoading(false);
      return;
    }

    try {
      const data = await electronAPI.getStorageSettings();
      setCustomSqlitePath(data.customSqlitePath || "");
      setCustomUploadsDir(data.customUploadsDir || "");
      setStatus(data);
    } catch (err) {
      setFeedback({
        type: "error",
        text: `Erro ao carregar configurações: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handlePickSqliteFile = async () => {
    const result = await electronAPI.pickSqliteFile();
    if (!result?.canceled && result?.path) {
      setCustomSqlitePath(result.path);
      setFeedback(null);
    }
  };

  const handlePickUploadsDir = async () => {
    const result = await electronAPI.pickUploadsDir();
    if (!result?.canceled && result?.path) {
      setCustomUploadsDir(result.path);
      setFeedback(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isElectron) return;

    setSaving(true);
    setFeedback(null);

    try {
      const updated = await electronAPI.saveStorageSettings({
        customSqlitePath,
        customUploadsDir,
      });
      setCustomSqlitePath(updated.customSqlitePath || "");
      setCustomUploadsDir(updated.customUploadsDir || "");
      setStatus(updated);
      setFeedback({
        type: updated.backendRunning ? "success" : "error",
        text: updated.backendRunning
          ? "Configurações salvas e backend reiniciado!"
          : `Salvo, mas o backend falhou ao iniciar: ${updated.lastBackendError || "erro desconhecido"}`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: `Erro ao salvar configurações: ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <GoBackButton />

        <h1 className="text-3xl font-extrabold text-slate-900 mt-6 mb-2">
          Configurações de Armazenamento
        </h1>
        <p className="text-slate-600 mb-6">
          Escolha o arquivo do banco SQLite (<code>prod.sqlite3</code>) e a pasta onde os documentos são salvos.
        </p>

        {!isElectron ? (
          <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-xl">
            Esta página precisa ser aberta pelo aplicativo desktop (Electron) para alterar caminhos locais.
          </div>
        ) : loading ? (
          <div className="p-6 bg-white rounded-2xl shadow">Carregando...</div>
        ) : (
          <div className="space-y-6">
            {/* Status atual */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Status Atual</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    status?.backendRunning
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {status?.backendRunning ? "Backend Ativo" : "Backend Parado"}
                </span>
              </div>

              <div className="text-sm space-y-2">
                <div>
                  <span className="font-semibold text-slate-600">Banco SQLite em uso: </span>
                  <span className="font-mono break-all text-slate-900">
                    {status?.activeSqlitePath || "—"}
                  </span>
                  {status?.activeSqlitePath && (
                    <span
                      className={`ml-2 text-xs font-semibold ${
                        status.sqliteExists ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      ({status.sqliteExists ? "Arquivo encontrado" : "Arquivo ainda não existe"})
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-slate-600">Pasta Uploads em uso: </span>
                  <span className="font-mono break-all text-slate-900">
                    {status?.activeUploadsDir || "—"}
                  </span>
                </div>

                <div className="text-xs text-slate-500 pt-1">
                  Arquivo de configuração: <span className="font-mono break-all">{status?.configPath}</span>
                </div>
              </div>

              {status?.lastBackendError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono rounded-lg whitespace-pre-wrap">
                  {status.lastBackendError}
                </div>
              )}
            </div>

            {/* Formulário */}
            <form
              onSubmit={handleSave}
              className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Caminho do Banco SQLite (.sqlite3)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Deixe em branco para detectar automaticamente dentro de <code>&lt;Uploads&gt;/Database/</code>.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customSqlitePath}
                    onChange={(e) => setCustomSqlitePath(e.target.value)}
                    placeholder="Ex: F:\Documents\ExpenseTracker\uploads\Database\prod.sqlite3"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handlePickSqliteFile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition cursor-pointer"
                  >
                    Procurar Arquivo
                  </button>
                  {customSqlitePath && (
                    <button
                      type="button"
                      onClick={() => setCustomSqlitePath("")}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Pasta de Uploads / Documentos
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Pasta onde boletos e comprovantes enviados ficam salvos.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customUploadsDir}
                    onChange={(e) => setCustomUploadsDir(e.target.value)}
                    placeholder="Ex: F:\Documents\ExpenseTracker\uploads"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handlePickUploadsDir}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition cursor-pointer"
                  >
                    Procurar Pasta
                  </button>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-sm font-medium ${
                    feedback.type === "success"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {saving ? "Salvando e reiniciando..." : "Salvar e Aplicar"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
