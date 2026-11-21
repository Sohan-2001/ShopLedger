var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');

function figures(order) {
  return invoice.computeInvoiceFigures(order);
}

test('#1001 invoices mixed 5% and 12% HSN items at their HSN rates', function () {
  var result = figures({
    id: 1001,
    coupon: '',
    items: [
      { name: 'Rice', hsn: '1006', price: 500, qty: 1 },
      { name: 'Ghee', hsn: '0405', price: 500, qty: 1 }
    ]
  });

  assert.deepEqual({ tax: result.tax, total: result.total }, { tax: 85, total: 1085 });
  assert.deepEqual(result.rows.map(function (row) { return row.gstPercent; }), [5, 12]);
});

test('#1002 applies SAVE10 before HSN-based tax', function () {
  var result = figures({
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', hsn: '1006', price: 500, qty: 1 },
      { name: 'Ghee', hsn: '0405', price: 500, qty: 1 }
    ]
  });

  assert.deepEqual(
    { subtotal: result.subtotal, discount: result.discount, tax: result.tax, total: result.total },
    { subtotal: 1000, discount: 100, tax: 76.5, total: 976.5 }
  );
});

test('#1004 applies the SAVE10 maximum discount of ₹150 before tax', function () {
  var result = figures({
    id: 1004,
    coupon: 'SAVE10',
    items: [{ name: 'Tea', hsn: '0902', price: 2240, qty: 1 }]
  });

  assert.deepEqual(
    { discount: result.discount, tax: result.tax, total: result.total },
    { discount: 150, tax: 376.2, total: 2466.2 }
  );
});

test('#1008 invoices 18% HSN items correctly when no coupon is used', function () {
  var result = figures({
    id: 1008,
    coupon: '',
    items: [{ name: 'Tea', hsn: '0902', price: 1000, qty: 1 }]
  });

  assert.deepEqual(
    { subtotal: result.subtotal, discount: result.discount, tax: result.tax, total: result.total },
    { subtotal: 1000, discount: 0, tax: 180, total: 1180 }
  );
});

test('EXPECTED: invoices use HSN slabs and apply the capped coupon discount before tax', function () {
  var discountedMixedRates = figures({
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', hsn: '1006', price: 500, qty: 1 },
      { name: 'Ghee', hsn: '0405', price: 500, qty: 1 }
    ]
  });
  var cappedDiscount = figures({
    id: 1004,
    coupon: 'SAVE10',
    items: [{ name: 'Tea', hsn: '0902', price: 2240, qty: 1 }]
  });

  assert.deepEqual(
    {
      discount: discountedMixedRates.discount,
      tax: discountedMixedRates.tax,
      total: discountedMixedRates.total,
      slabs: discountedMixedRates.rows.map(function (row) { return row.gstPercent; })
    },
    { discount: 100, tax: 76.5, total: 976.5, slabs: [5, 12] }
  );
  assert.deepEqual(
    { discount: cappedDiscount.discount, tax: cappedDiscount.tax, total: cappedDiscount.total },
    { discount: 150, tax: 376.2, total: 2466.2 }
  );
});
