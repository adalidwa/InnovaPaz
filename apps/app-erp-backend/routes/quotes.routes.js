const express = require('express');
const router = express.Router();
const {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  convertToOrder,
  deleteQuote,
  generateQuoteNumber,
} = require('../controllers/quotes.controller');

// Rutas de cotizaciones
router.get('/', getAllQuotes);
router.get('/generate-number', generateQuoteNumber);
router.get('/:quoteId', getQuoteById);
router.post('/', createQuote);
router.put('/:quoteId', updateQuote);
router.put('/:quoteId/status', updateQuoteStatus);
router.put('/:quoteId/convert', convertToOrder);
router.delete('/:quoteId', deleteQuote);

module.exports = router;
