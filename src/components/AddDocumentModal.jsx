import Select from 'react-select'
import { useState } from 'react'

export default function AddDocumentModal({ isOpen, onClose, onSave, accounts }) {
  const [documentFile, setDocumentFile] = useState(null)
  const [type, setType] = useState('0')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [cost, setCost] = useState('')

  if (!isOpen) return null

  // Mock invoices por account
  const invoicesByAccount = {
    1: [
      { value: 101, label: 'Invoice 001-1' },
      { value: 102, label: 'Invoice 002-1' },
    ],
    2: [{ value: 201, label: 'Invoice 001-2' }],
    3: [
      { value: 301, label: 'Invoice 001-3' },
      { value: 302, label: 'Invoice 002-3' },
      { value: 303, label: 'Invoice 003-3' },
    ],
  }

  const accountOptions = accounts.map((acc) => ({ value: acc.id, label: acc.name }))
  const invoiceOptions = selectedAccount ? invoicesByAccount[selectedAccount.value] || [] : []

  const handleSave = () => {
    if (!documentFile || !selectedAccount || !selectedInvoice || !cost)
      return alert('Preencha todos os campos!')

    onSave({
      documentFile,
      type,
      accountId: selectedAccount.value,
      invoiceId: selectedInvoice.value,
      cost: parseFloat(cost),
    })

    // reset
    setDocumentFile(null)
    setType('0')
    setSelectedAccount(null)
    setSelectedInvoice(null)
    setCost('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Adicionar Documento</h2>

        {/* Documento (arquivo) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Documento</label>
          <input
            type="file"
            onChange={(e) => setDocumentFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {documentFile && <p className="mt-2 text-sm text-gray-600">Arquivo selecionado: {documentFile.name}</p>}
        </div>

        {/* Tipo */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="0">Recibo</option>
            <option value="1">Boleto</option>
          </select>
        </div>

        {/* Select de Conta */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Conta</label>
          <Select
            options={accountOptions}
            value={selectedAccount}
            onChange={(acc) => {
              setSelectedAccount(acc)
              setSelectedInvoice(null)
            }}
            placeholder="Selecione uma conta"
          />
        </div>

        {/* Select de Invoice */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Invoice</label>
          <Select
            options={invoiceOptions}
            value={selectedInvoice}
            onChange={setSelectedInvoice}
            placeholder={selectedAccount ? 'Selecione uma invoice' : 'Selecione uma conta primeiro'}
            isDisabled={!selectedAccount}
          />
        </div>

        {/* Custo */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Custo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
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