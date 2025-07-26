import { NepPayments } from 'neppayments';

function getEnvMode(env) {
  return env === 'production' ? 'production' : 'sandbox';
}

const payments = new NepPayments({
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY,
    environment: getEnvMode(process.env.KHALTI_ENV)
  }
});

export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { amount, orderId, name, email, phone } = req.body;
    const payment = await payments.khalti.createPayment({
      amount: amount * 100, // paisa
      purchase_order_id: orderId,
      purchase_order_name: 'Order Payment',
      return_url: process.env.CLIENT_URL + '/order-confirmation',
      website_url: process.env.CLIENT_URL,
      customer_info: { name, email, phone }
    });
    res.json({ payment_url: payment.payment_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import { markOrderPaid } from './orderController.js';

export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;
    const verification = await payments.khalti.verifyPayment({ pidx });
    if (verification.status === 'Completed') {
      // Mark order as paid and reduce stock
      await markOrderPaid({ body: { orderId, paymentInfo: verification } }, {
        json: (data) => res.json({ ...verification, ...data }),
        status: (code) => res.status(code)
      });
    } else {
      res.json(verification);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
