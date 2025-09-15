import { useState } from 'react'

export default function AddInvoiceModal({ isOpen, onClose, onSave }) {
  const [invoiceName, setInvoiceName] = useState('')
  const [dueDay, setDueDay] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    if (!invoiceName || !dueDay) return alert('Preencha todos os campos!')
    onSave({ invoiceName, dueDay })
    setInvoiceName('')
    setDueDay('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Adicionar Nova Fatura</h2>

        {/* Nome da Fatura */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Nome da conta</label>
          <input
            type="text"
            value={invoiceName}
            onChange={(e) => setInvoiceName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: Conta Empresa XPTO"
          />
        </div>

        {/* Dia de Vencimento */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Dia de Vencimento</label>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="1 - 31"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
