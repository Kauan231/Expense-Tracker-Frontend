import { useState } from "react";

export default function UploadInvoiceModal({ isOpen, onClose, onSubmit, invoiceId, type }) {
  const [file, setFile] = useState(null);
  const [cost, setCost] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !cost) return;

    // The rest is auto-filled here
    const payload = {
      invoiceId,
      type,
      cost: parseFloat(cost),
      file
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Upload Invoice Document</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cost input */}
          <div>
            <label className="block text-sm font-medium mb-1">Cost</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter cost"
              required
            />
          </div>

          {/* File input */}
          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
