const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Add this line
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors()); // Add this line
app.use(express.static('src'));

const db = new sqlite3.Database('stock_take.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    serial INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    part_number TEXT,
    company TEXT,
    description TEXT,
    cost_price REAL,
    selling_price REAL,
    quantity INTEGER
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table created successfully or already exists');
    }
  });
});

app.post('/save-item', (req, res) => {
  const { barcode, part_number, company, description, cost_price, selling_price, quantity } = req.body;
  console.log('Received request to save item:', req.body);
  db.get("SELECT * FROM items WHERE barcode = ?", [barcode], (err, row) => {
    if (err) {
      console.error('Error fetching item:', err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      // Barcode exists, update the quantity
      const newQuantity = row.quantity + parseInt(quantity);
      const stmt = db.prepare("UPDATE items SET part_number = ?, company = ?, description = ?, cost_price = ?, selling_price = ?, quantity = ? WHERE barcode = ?");
      stmt.run(part_number, company, description, cost_price, selling_price, newQuantity, barcode, (err) => {
        if (err) {
          console.error('Error updating item:', err.message);
          res.status(500).json({ error: err.message });
        } else {
          console.log('Item updated successfully:', { barcode, newQuantity });
          res.status(200).json({ message: 'Item updated successfully' });
        }
      });
      stmt.finalize();
    } else {
      // Barcode does not exist, insert new item
      const stmt = db.prepare("INSERT INTO items (barcode, part_number, company, description, cost_price, selling_price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)");
      stmt.run(barcode, part_number, company, description, cost_price, selling_price, quantity, (err) => {
        if (err) {
          console.error('Error inserting item:', err.message);
          res.status(500).json({ error: err.message });
        } else {
          console.log('Item saved successfully:', { barcode, quantity });
          res.status(200).json({ message: 'Item saved successfully' });
        }
      });
      stmt.finalize();
    }
  });
});

app.post('/update-item', (req, res) => {
  const { barcode, part_number, company, description, cost_price, selling_price, quantity } = req.body;
  console.log('Received request to update item:', req.body);
  const stmt = db.prepare("UPDATE items SET part_number = ?, company = ?, description = ?, cost_price = ?, selling_price = ?, quantity = ? WHERE barcode = ?");
  stmt.run(part_number, company, description, cost_price, selling_price, quantity, barcode, (err) => {
    if (err) {
      console.error('Error updating item:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Item updated successfully:', { barcode, quantity });
      res.status(200).json({ message: 'Item updated successfully' });
    }
  });
  stmt.finalize();
});

app.post('/clear-database', (req, res) => {
  console.log('Received request to clear database');
  db.run("DELETE FROM items", (err) => {
    if (err) {
      console.error('Error clearing database:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Database cleared successfully');
      res.status(200).json({ message: 'Database cleared successfully' });
    }
  });
});

app.get('/get-items', (req, res) => {
  console.log('Received request to get items');
  db.all("SELECT * FROM items ORDER BY barcode ASC", [], (err, rows) => {
    if (err) {
      console.error('Error fetching items:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Fetched items:', rows); // Add logging
      res.status(200).json(rows);
    }
  });
});

app.get('/get-item', (req, res) => {
  const { barcode } = req.query;
  console.log('Received request to get item:', { barcode });
  db.get("SELECT * FROM items WHERE barcode = ?", [barcode], (err, row) => {
    if (err) {
      console.error('Error fetching item:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Fetched item:', row);
      res.status(200).json(row);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
