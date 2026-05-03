const modal = document.getElementById('clientModal');
const generateBtn = document.getElementById('generateInvoiceBtn');
let currentCart = [];

if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        const storedCart = JSON.parse(localStorage.getItem('hydroCart')) || [];
        if (storedCart.length === 0) { alert("Cart is empty."); return; }
        currentCart = storedCart;
        modal.style.display = 'flex';
    });
}

document.getElementById('closeModalBtn')?.addEventListener('click', () => modal.style.display = 'none');
document.getElementById('confirmInvoiceBtn')?.addEventListener('click', async () => {
    const clientName = document.getElementById('clientName').value.trim();
    const clientPhone = document.getElementById('clientPhone').value.trim();
    const clientEmail = document.getElementById('clientEmail').value.trim();
    if (!clientName || !clientPhone || !clientEmail) { alert("Please fill all details."); return; }
    modal.style.display = 'none';
    await generateProformaPDF(clientName, clientPhone, clientEmail, currentCart);
});

async function generateProformaPDF(name, phone, email, items) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(20);
    doc.setTextColor(10,47,68);
    doc.text("HydroStudia", pageWidth/2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(80,80,100);
    doc.text("Hydraulic engineering & equipment", pageWidth/2, 28, { align: 'center' });
    const invoiceNumber = "INV-" + new Date().getFullYear() + Math.floor(Math.random()*10000);
    const date = new Date().toLocaleDateString();
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 45);
    doc.text(`Date: ${date}`, 20, 52);
    doc.text("Bill to:", 20, 65);
    doc.setFontSize(10);
    doc.text(`${name}`, 20, 73);
    doc.text(`Tel: ${phone}    Email: ${email}`, 20, 80);
    
    const tableBody = items.map(item => {
        if (item.unit === 'meter') {
            const lineTotal = item.pricePerMeter * item.quantity;
            return [`${item.name}`, `${item.quantity} m`, `${item.pricePerMeter.toLocaleString()} DZD/m`, `${lineTotal.toLocaleString()} DZD`];
        } else {
            const lineTotal = item.price * item.quantity;
            return [`${item.name}`, `${item.quantity} ${item.unit === 'piece' ? 'pc' : 'unit'}`, `${item.price.toLocaleString()} DZD`, `${lineTotal.toLocaleString()} DZD`];
        }
    });
    const total = items.reduce((s, i) => s + (i.unit === 'meter' ? i.pricePerMeter * i.quantity : i.price * i.quantity), 0);
    doc.autoTable({
        startY: 92,
        head: [['Product', 'Qty', 'Unit price', 'Total']],
        body: tableBody,
        foot: [['', '', 'Grand Total', `${total.toLocaleString()} DZD`]],
        theme: 'striped',
        headStyles: { fillColor: [28,110,143], textColor: 255 }
    });
    let finalY = doc.lastAutoTable.finalY + 10;
    const qrUrl = `https://hydrostudia.com/verify?ref=${invoiceNumber}`;
    const tempDiv = document.createElement('div');
    tempDiv.id = 'tempQR';
    document.body.appendChild(tempDiv);
    new QRCode(tempDiv, { text: qrUrl, width: 80, height: 80 });
    await new Promise(r => setTimeout(r, 100));
    const qrCanvas = tempDiv.querySelector('canvas');
    if (qrCanvas) {
        const qrData = qrCanvas.toDataURL('image/png');
        doc.addImage(qrData, 'PNG', pageWidth-35, finalY, 28, 28);
    }
    document.body.removeChild(tempDiv);
    doc.setFontSize(8);
    doc.text("Scan QR to verify invoice", pageWidth-38, finalY+32, { align: 'right' });
    doc.text("Terms: This is a proforma invoice. Valid for 30 days.", 20, finalY+30);
    doc.save(`Proforma_${invoiceNumber}.pdf`);
    alert("Proforma invoice generated and downloaded.");
}