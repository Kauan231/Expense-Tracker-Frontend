const URL = "http://localhost:3000"

export async function readAllInvoiceTrackerIds() {
    const skip = 0;
    const limit = 100;
    const res = await fetch(URL+`/invoiceTrackers?skip=${skip}&limit=${limit}`, {
        method: "GET"
    });
    let result = await res.json();
    return result.result;
}

export async function readAllInvoiceTracker(id) {
    const res = await fetch(URL+`/invoiceTrackers/${id}`, {
        method: "GET"
    });
    let result = await res.json();
    return result.result;
}

export async function saveDocument(document) {
    const formData = new FormData();
    formData.append("type", document.type);
    formData.append("invoiceId", document.invoiceId);
    formData.append("cost", document.cost);
    formData.append("file", document.file); // this must be a File or Blob

    console.log("FormData sending...", [...formData.entries()]);

    const res = await fetch(URL+`/documents/create`, {
        method: "POST",
        body: formData
    });

    let result = await res.json();
    return result.result;
}