const { NepPayments } = require('neppayments');

const payments = new NepPayments({
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY,
    environment: 'sandbox'
  },
  esewa: {
    productCode: 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY,
    environment: 'sandbox',
    successUrl: 'https://yourdomain.com/payment-success',
    failureUrl: 'https://yourdomain.com/payment-failure'
  }
});

// Initiate Khalti Payment
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { amount, orderId, name, email, phone } = req.body;
    const payment = await payments.khalti.createPayment({
      amount: amount * 100, // paisa
      purchase_order_id: orderId,
      purchase_order_name: 'Order Payment',
      return_url: 'https://yourdomain.com/payment-success',
      website_url: 'https://yourdomain.com',
      customer_info: { name, email, phone }
    });
    res.json({ payment_url: payment.payment_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Initiate eSewa Payment
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const payment = await payments.esewa.createPayment({
      amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: orderId,
      product_code: 'EPAYTEST',
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: 'https://yourdomain.com/payment-success',
      failure_url: 'https://yourdomain.com/payment-failure',
      signed_field_names: 'total_amount,transaction_uuid,product_code'
    });
    res.send(payment.form_html); // Send HTML form to client
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Khalti Payment
exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    const verification = await payments.khalti.verifyPayment({ pidx });
    res.json(verification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify eSewa Payment
exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { transaction_uuid, total_amount } = req.body;
    const verification = await payments.esewa.verifyPayment({
      product_code: 'EPAYTEST',
      transaction_uuid,
      total_amount
    });
    res.json(verification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
