import Select from 'react-select'
import { useState, useEffect } from 'react'
import { readAllInvoiceTrackerIds } from '../requests'

export default function AddNewPeriodModal({ isOpen, onClose, onSave }) {
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [year, setYear] = useState('')

  const [invoiceTrackers, setInvoiceTrackers] = useState([])

  const getInvoiceTrackers = async () => {
    let results = await readAllInvoiceTrackerIds();
    results = results.map((acc) => ({ value: acc.id, label: acc.name }))
    setInvoiceTrackers(results)
  }

  useEffect(() => {
    getInvoiceTrackers();
  }, [isOpen])

  useEffect(() => {
    if((invoiceTrackers?.length ?? []).length == 0) { return; }
    setSelectedAccount(invoiceTrackers[0])
  }, [invoiceTrackers])

  if (!isOpen) return null

  const handleSave = () => {
    if (!selectedAccount || !year)
      return alert('Preencha todos os campos!')

    onSave({
      accountId: selectedAccount.value,
      year: parseFloat(year),
    })

    // reset
    setSelectedAccount(null)
    setYear('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Adicionar Documento</h2>

        {/* Select de Conta */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Conta</label>
          <Select
            options={invoiceTrackers}
            value={selectedAccount}
            onChange={(acc) => {
              setSelectedAccount(acc)
              setSelectedInvoice(null)
            }}
            placeholder="Selecione uma conta"
          />
        </div>

        {/* Ano */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Ano</label>
          <input
            type="number"
            min="2000"
            step="1"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="2000"
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