const express = require('express');
const sql = require('mssql');
const nodemailer = require('nodemailer');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());


const config = {
  user: 'Prerna9211', 
  password: 'Prerna@9211', 
  server: 'inventoryserver20251.database.windows.net', 
  database: 'InventoryDB',
  options: {
    encrypt: true, 
    trustServerCertificate: false 
  }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'prernakumari7427@gmail.com',
      pass: 'pjlj tokp zlzt btfl' 
    }
  });
  
  
  app.post('/orders', async (req, res) => {
    const { ProductID, QuantityRequired, CustomerName } = req.body;
    
  
    try {
      const pool = await sql.connect(config);
  
      
      const result = await pool.request()
        .input('ProductID', sql.Int, ProductID)
        .query('SELECT * FROM Inventory WHERE ProductID = @ProductID');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const product = result.recordset[0];
  
     
      if (product.QuantityAvailable < QuantityRequired) {
        
        const mailOptions = {
          from: 'p1932114@gmail.com',
          to:'prernakumari7427@gmail.com',
          subject: 'Product Out of Stock',
          text: `Dear Supplier,\n\nProduct "${product.ProductName}" (ID: ${ProductID}) is out of stock.\nPlease restock it.\n\nThanks,\nInventory System`
        };
  
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Out of stock. Email sent to supplier.' });
      }
  
    
      await pool.request()
        .input('ProductID', sql.Int, ProductID)
        .input('QuantityRequired', sql.Int, QuantityRequired)
        .input('CustomerName', sql.NVarChar, CustomerName)
        .query('INSERT INTO Orders (ProductID, QuantityRequired, CustomerName) VALUES (@ProductID, @QuantityRequired, @CustomerName)');
  
    
      await pool.request()
        .input('ProductID', sql.Int, ProductID)
        .input('QuantityRequired', sql.Int, QuantityRequired)
        .query('UPDATE Inventory SET QuantityAvailable = QuantityAvailable - @QuantityRequired WHERE ProductID = @ProductID');
  
      res.status(200).json({ message: 'Order placed and inventory updated' });
  
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });