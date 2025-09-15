import { useState, useEffect } from 'react'
import Select from 'react-select'
import { readAllInvoiceTrackerIds, readAllInvoiceTracker } from "../requests"
import GoBackButton from '../components/GoBackButton'

// Mock de contas e faturas
const accounts = [
  { id: 1, name: 'Conta A' },
  { id: 2, name: 'Conta B' },
  { id: 3, name: 'Conta C' },
]

const mockInvoices = [
  {
    id: 1,
    accountId: 1,
    name: 'Fatura Março',
    dueDate: '2025-03-15',
    cost: 120.5,
    status: 0,
    receiptUploaded: false,
    boletoUploaded: true,
  },
  {
    id: 2,
    accountId: 2,
    name: 'Fatura Abril',
    dueDate: '2025-04-10',
    cost: 250.0,
    status: 1,
    receiptUploaded: true,
    boletoUploaded: true,
  },
  {
    id: 3,
    accountId: 1,
    name: 'Fatura Maio',
    dueDate: '2025-05-20',
    cost: 75.25,
    status: 0,
    receiptUploaded: false,
    boletoUploaded: false,
  },
]


export default function InvoicePage() {
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [invoiceTrackers, setInvoiceTrackers] = useState([])

  const getInvoiceTrackers = async () => {
    let results = await readAllInvoiceTrackerIds();
    results = results.map((acc) => ({ value: acc.id, label: acc.name }))
    setInvoiceTrackers(results)
  }

  const getInvoiceTracker = async (id) => {
    if(id == undefined) { return; }
    let results = await readAllInvoiceTracker(id);
    setInvoices(results?.Invoices)
  }

  useEffect(() => {
    getInvoiceTrackers();
  }, [])

  useEffect(() => {
    if((invoiceTrackers?.length ?? []).length == 0) { return; }
    setSelectedAccount(invoiceTrackers[0])
    getInvoiceTracker(invoiceTrackers[0]?.value);
  }, [invoiceTrackers])

  // Filtra as invoices pela conta selecionada
  const filteredInvoices = selectedAccount
    ? invoices.filter((inv) => inv.accountId === selectedAccount.value)
    : invoices

  // Função mock de upload
  const handleUpload = (invoiceId, type) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          if (type === 'receipt') inv.receiptUploaded = true
          if (type === 'boleto') inv.boletoUploaded = true
        }
        return inv
      })
    )
  }

  return (
    <div className="w-screen min-h-screen bg-gray-100 p-4 sm:p-6">
      <GoBackButton/>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 mt-6">Faturas</h1>

      {/* Filtro de conta */}
      <div className="w-full max-w-md mb-6">
        <Select
          options={invoiceTrackers}
          value={selectedAccount}
          onChange={setSelectedAccount}
          isClearable
          placeholder="Filtrar por conta"
        />
      </div>

      {/* Lista de faturas */}
      <div className="overflow-x-auto w-full">
        <table className="w-full table-auto bg-white rounded-2xl shadow-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Vencimento</th>
              <th className="px-4 py-2 text-right">Custo</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Recibo</th>
              <th className="px-4 py-2 text-center">Boleto</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">{inv.id}</td>
                <td className="px-4 py-2">
                {new Date(inv.date).toLocaleString("pt-BR", {
                  month: "short",
                  year: "numeric"
                }).replace(" de", "").toUpperCase()}
              </td>
              <td className="px-4 py-2">
                {new Date(inv.date).toLocaleString("pt-BR", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric"
                }).replace(" de", "").toUpperCase()}
              </td>
                <td className="px-4 py-2 text-right">${(inv.cost ?? 0)?.toFixed(2)}</td>
                <td className="px-4 py-2">
                  {inv.status === 0 ? (
                    <span className="px-2 py-1 rounded-full bg-yellow-300 text-yellow-900 font-semibold">
                      Pendente
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-green-300 text-green-900 font-semibold">
                      Preenchido
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleUpload(inv.id, 'receipt')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      inv.receiptUploaded
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Recibo
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleUpload(inv.id, 'boleto')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      inv.boletoUploaded
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Boleto
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
