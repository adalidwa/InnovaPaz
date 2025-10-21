const pool = require('../db');

// ========== PROVIDERS ==========
const getProviders = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Error fetching providers' });
  }
};

const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Error fetching provider' });
  }
};

const createProvider = async (req, res) => {
  try {
    const { title, description, nit, contact, phone, email, address } = req.body;
    const result = await pool.query(
      'INSERT INTO providers (title, description, nit, contact, phone, email, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, nit, contact, phone, email, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Error creating provider' });
  }
};

const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, nit, contact, phone, email, address } = req.body;
    const result = await pool.query(
      'UPDATE providers SET title = $1, description = $2, nit = $3, contact = $4, phone = $5, email = $6, address = $7, updated_at = now() WHERE id = $8 RETURNING *',
      [title, description, nit, contact, phone, email, address, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ error: 'Error updating provider' });
  }
};

const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM providers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ error: 'Error deleting provider' });
  }
};

// ========== PRODUCTS ==========
const getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      supplier_id,
      supplier_name,
      unit_price,
      current_stock,
      min_stock,
      max_stock,
      status,
    } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, description, category, unit, supplier_id, supplier_name, unit_price, current_stock, min_stock, max_stock, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [
        name,
        description,
        category,
        unit,
        supplier_id,
        supplier_name,
        unit_price,
        current_stock,
        min_stock,
        max_stock,
        status,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      unit,
      supplier_id,
      supplier_name,
      unit_price,
      current_stock,
      min_stock,
      max_stock,
      status,
    } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, category = $3, unit = $4, supplier_id = $5, supplier_name = $6, unit_price = $7, current_stock = $8, min_stock = $9, max_stock = $10, status = $11, updated_at = now() WHERE id = $12 RETURNING *',
      [
        name,
        description,
        category,
        unit,
        supplier_id,
        supplier_name,
        unit_price,
        current_stock,
        min_stock,
        max_stock,
        status,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

// ========== PURCHASE ORDERS ==========
const getPurchaseOrders = async (req, res) => {
  try {
    const ordersResult = await pool.query('SELECT * FROM purchase_orders ORDER BY id DESC');
    const orders = ordersResult.rows;

    // Get items for each order
    for (let order of orders) {
      const itemsResult = await pool.query(
        'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1',
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Error fetching purchase orders' });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const order = orderResult.rows[0];
    const itemsResult = await pool.query(
      'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1',
      [id]
    );
    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Error fetching purchase order' });
  }
};

const createPurchaseOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { order_number, date, supplier_id, supplier_name, items, status, notes } = req.body;

    // Calculate totals
    const total_items = items.length;
    const total_amount = items.reduce((sum, item) => sum + parseFloat(item.total), 0);

    // Create purchase order
    const orderResult = await client.query(
      'INSERT INTO purchase_orders (order_number, date, supplier_id, supplier_name, total_items, total_amount, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [order_number, date, supplier_id, supplier_name, total_items, total_amount, status, notes]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (let item of items) {
      await client.query(
        'INSERT INTO purchase_order_items (purchase_order_id, product_id, product_name, quantity, unit_price, total) VALUES ($1, $2, $3, $4, $5, $6)',
        [order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.total]
      );
    }

    await client.query('COMMIT');

    // Fetch complete order with items
    const itemsResult = await client.query(
      'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1',
      [order.id]
    );
    order.items = itemsResult.rows;

    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Error creating purchase order' });
  } finally {
    client.release();
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await pool.query(
      'UPDATE purchase_orders SET status = $1, notes = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [status, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Error updating purchase order' });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Error deleting purchase order' });
  }
};

// ========== RECEPTIONS ==========
const getReceptions = async (req, res) => {
  try {
    const receptionsResult = await pool.query('SELECT * FROM receptions ORDER BY id DESC');
    const receptions = receptionsResult.rows;

    for (let reception of receptions) {
      const itemsResult = await pool.query(
        'SELECT * FROM reception_items WHERE reception_id = $1',
        [reception.id]
      );
      reception.items = itemsResult.rows;
    }

    res.json(receptions);
  } catch (error) {
    console.error('Error fetching receptions:', error);
    res.status(500).json({ error: 'Error fetching receptions' });
  }
};

const createReception = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      reception_number,
      date,
      order_number,
      supplier_id,
      supplier_name,
      received_by,
      items,
      status,
      notes,
    } = req.body;

    // Create reception
    const receptionResult = await client.query(
      'INSERT INTO receptions (reception_number, date, order_number, supplier_id, supplier_name, received_by, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [reception_number, date, order_number, supplier_id, supplier_name, received_by, status, notes]
    );

    const reception = receptionResult.rows[0];

    // Create reception items
    for (let item of items) {
      const difference = item.received_quantity - (item.expected_quantity || 0);
      await client.query(
        'INSERT INTO reception_items (reception_id, product_id, product_name, expected_quantity, received_quantity, difference, unit_price) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          reception.id,
          item.product_id,
          item.product_name,
          item.expected_quantity,
          item.received_quantity,
          difference,
          item.unit_price,
        ]
      );
    }

    await client.query('COMMIT');

    // Fetch complete reception with items
    const itemsResult = await client.query(
      'SELECT * FROM reception_items WHERE reception_id = $1',
      [reception.id]
    );
    reception.items = itemsResult.rows;

    res.status(201).json(reception);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating reception:', error);
    res.status(500).json({ error: 'Error creating reception' });
  } finally {
    client.release();
  }
};

// ========== CONTRACTS ==========
const getContracts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contracts ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Error fetching contracts' });
  }
};

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Error fetching contract' });
  }
};

const createContract = async (req, res) => {
  try {
    const {
      contract_number,
      provider_id,
      provider_name,
      type,
      start_date,
      end_date,
      amount,
      status,
      terms,
      document_path,
      renewal_alert,
    } = req.body;
    const result = await pool.query(
      'INSERT INTO contracts (contract_number, provider_id, provider_name, type, start_date, end_date, amount, status, terms, document_path, renewal_alert) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [
        contract_number,
        provider_id,
        provider_name,
        type,
        start_date,
        end_date,
        amount,
        status,
        terms,
        document_path,
        renewal_alert,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Error creating contract' });
  }
};

const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contract_number,
      provider_id,
      provider_name,
      type,
      start_date,
      end_date,
      amount,
      status,
      terms,
      document_path,
      renewal_alert,
    } = req.body;
    const result = await pool.query(
      'UPDATE contracts SET contract_number = $1, provider_id = $2, provider_name = $3, type = $4, start_date = $5, end_date = $6, amount = $7, status = $8, terms = $9, document_path = $10, renewal_alert = $11, updated_at = now() WHERE id = $12 RETURNING *',
      [
        contract_number,
        provider_id,
        provider_name,
        type,
        start_date,
        end_date,
        amount,
        status,
        terms,
        document_path,
        renewal_alert,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Error updating contract' });
  }
};

const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contracts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Error deleting contract' });
  }
};

module.exports = {
  // Providers
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,

  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  // Purchase Orders
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,

  // Receptions
  getReceptions,
  createReception,

  // Contracts
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
};
