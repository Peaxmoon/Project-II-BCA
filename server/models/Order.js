import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const paymentResultSchema = new mongoose.Schema({
  id: { type: String },
  status: { type: String },
  update_time: { type: String },
  email_address: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: paymentResultSchema, // info from payment gateway like Stripe/PayPal

  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },

  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },

  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },

  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
