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