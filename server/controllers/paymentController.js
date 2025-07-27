import { NepPayments } from 'neppayments';
import { markOrderPaid } from './orderController.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

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

export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;
    const verification = await payments.khalti.verifyPayment({ pidx });

    if (verification.status === 'Completed') {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Reduce stock for each product in the order
      try {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Product not found: ${item.product}`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${item.name}`);
          }
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      } catch (error) {
        return res.status(500).json({ message: `Error reducing stock: ${error.message}` });
      }

      // Mark order as paid and update status
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
