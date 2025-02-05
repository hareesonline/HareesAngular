document.getElementById('itemForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const barcode = document.getElementById('barcode').value;
    const description = document.getElementById('description').value;
    const quantity = document.getElementById('quantity').value;

    const table = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const barcodeCell = newRow.insertCell(0);
    const descriptionCell = newRow.insertCell(1);
    const quantityCell = newRow.insertCell(2);

    barcodeCell.textContent = barcode;
    descriptionCell.textContent = description;
    quantityCell.textContent = quantity;

    document.getElementById('itemForm').reset();
});
