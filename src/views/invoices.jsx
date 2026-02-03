import { useState, useEffect } from 'react'
import Select from 'react-select'
import { readAllInvoiceTrackerIds, readAllInvoiceTracker, saveDocument, URL } from "../requests"
import GoBackButton from '../components/GoBackButton'
import UploadInvoiceModal from '../components/UploadInvoiceModal'
import YearSelect from '../components/YearSelect'

export default function InvoicePage() {
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [invoiceTrackers, setInvoiceTrackers] = useState([])
  const [showUploadModal , setShowUploadModal ] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [type, setType] = useState(0)
  const [yearFilter, setYearFilter] = useState();

  const getInvoiceTrackers = async () => {
    let results = await readAllInvoiceTrackerIds();
    results = results.map((acc) => ({ value: acc.id, label: acc.name }))
    setInvoiceTrackers(results)
  }

  const getInvoiceTracker = async (id) => {
    if(id == undefined) { return; }
    console.log("yearFilter", yearFilter)
    let results = await readAllInvoiceTracker(id, yearFilter);
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

  useEffect(() => {
    getInvoiceTracker(selectedAccount?.value);
  }, [selectedAccount, yearFilter])

  const handleUpload = (invoiceId, type) => {
    setCurrentInvoice(invoiceId)
    setShowUploadModal(true)
    setType(type)
  }

  return (
    <div className="w-screen min-h-screen bg-gray-100 p-4 sm:p-6">
      <GoBackButton/>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 mt-6">Faturas</h1>

      <div className="w-full mb-6 flex gap-2">
        {/* Filtro de conta */}
        <div className="w-[70%] max-w-md mb-6">
          <Select
            options={invoiceTrackers}
            value={selectedAccount}
            onChange={setSelectedAccount}
            isClearable
            placeholder="Filtrar por conta"
          />
        </div>

        {/* Filtro por ano */}
        <div className="max-w-md mb-6">
          <YearSelect
            invoices={invoices}
            selectedYear={yearFilter}
            setSelectedYear={setYearFilter}
          />
        </div>
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
                <td className="px-4 py-2 text-right">{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(inv.cost ?? 0)
                }</td>
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
                    onClick={() => handleUpload(inv.id, 1)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      inv.Documents.find(doc => doc?.type === 1) != undefined
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Recibo
                  </button>

                  <button
                    onClick={() => {
                      const document = inv.Documents.find(doc => doc?.type === 1);
                      const splittedPath = document.documentPath.split("/");
                      const documentName = splittedPath[splittedPath.length-1];
                      window.electronAPI.openFile(documentName);
                    }}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      inv.Documents.find(doc => doc?.type === 1) != undefined
                        ? 'bg-blue-600 text-white hover:bg-green-700 ml-2'
                        : 'hidden'
                    }`}
                  >
                    Ver
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleUpload(inv.id, 0)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      inv.Documents.find(doc => doc?.type === 0) != undefined
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Boleto
                  </button>

                  <button
                    onClick={() => {
                      const document = inv.Documents.find(doc => doc?.type === 0);
                      const splittedPath = document.documentPath.split("/");
                      const documentName = splittedPath[splittedPath.length-1];
                      window.electronAPI.openFile(documentName);
                    }}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      inv.Documents.find(doc => doc?.type === 0) != undefined
                        ? 'bg-blue-600 text-white hover:bg-blue-700 ml-2'
                        : 'hidden'
                    }`}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UploadInvoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={async (data) => {
          try { await saveDocument(data)
          } catch(e) { console.log("saveDocument failed", e) }
          setShowUploadModal(false)
          await getInvoiceTracker(selectedAccount?.value);
        }}
        invoiceId={currentInvoice}
        type={type}
      />
    </div>
  )
}
