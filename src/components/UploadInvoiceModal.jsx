import { useState } from "react";

export default function UploadInvoiceModal({ isOpen, onClose, onSubmit, invoiceId, type }) {
  const [file, setFile] = useState(null);
  const [cost, setCost] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // The rest is auto-filled here
    let payload = {
      invoiceId,
      type,
      file
    };

    if(cost != undefined) {
      payload.cost = parseFloat(cost);
    }

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Enviar documento</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cost input */}
          <div>
            <label className="block text-sm font-medium mb-1">Custo</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Digite o custo"
            />
          </div>

          {/* File input */}
          <div>
            <label className="block text-sm font-medium mb-1">Arquivo</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
