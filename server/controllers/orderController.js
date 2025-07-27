import Order from '../models/Order.js';
import Product from '../models/Product.js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility function for role check
function hasRole(user, roles = []) {user
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid
    } = req.body;

    // Fallback for guest checkout: allow user to be null
    const userId = req.user && req.user._id ? req.user._id : null;
    // Always create order as pending and unpaid unless COD
    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paymentMethod === 'cod' ? true : false,
      orderStatus: paymentMethod === 'cod' ? 'processing' : 'pending',
      paidAt: paymentMethod === 'cod' ? new Date() : null,
    });

    // Save the order first to get the order ID
    await order.save();

    // For COD orders, reduce stock immediately
    if (paymentMethod === 'cod') {
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
        // If stock reduction fails, delete the order and throw error
        await Order.findByIdAndDelete(order._id);
        throw new Error(`Error reducing stock: ${error.message}`);
      }
    }

    // Send confirmation email for COD if we have an email
    if (paymentMethod === 'cod' && (req.user?.email || shippingAddress?.email)) {
      const msg = {
        to: req.user?.email || shippingAddress.email,
        from: 'support@sujjalkhadka.com.np',
        subject: 'Order Confirmation - Cash on Delivery | ElectroMart E-commerce',
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your order <b>#${order._id}</b> has been placed successfully with <b>Cash on Delivery</b>.</p>
          <p>Order Total: <b>रु${order.totalPrice}</b></p>
          <p>We will contact you soon to confirm delivery details.</p>
          <hr>
          <p>If you have any questions, reply to this email or call our support hotline.</p>
        `
      };
      try {
        await sgMail.send(msg);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't throw error for email failure
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error); // Add this line
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};
// Mark order as paid and reduce stock after payment verification
export const markOrderPaid = async (req, res) => {
  try {
    const { orderId, paymentInfo } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isPaid) return res.status(400).json({ message: 'Order already marked as paid' });

    // Mark as paid
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = 'processing';
    order.paymentResult = paymentInfo || {};
    await order.save();

    // Reduce stock for each product
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Error marking order as paid', error: error.message });
  }
};

// List orders for user or all (admin)
export const listOrders = async (req, res) => {
  try {
    let orders;
    if (hasRole(req.user, ['admin'])) {
      orders = await Order.find().populate('user', 'name email');
    } else {
      orders = await Order.find({ user: req.user._id });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get single order by id (public for tracking, or user can access their own)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If user is authenticated, check if they can access this order
    if (req.user) {
      if (
        !hasRole(req.user, ['admin']) &&
        order.user._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
    }

    // For public tracking, only return basic order info without sensitive user data
    if (!req.user) {
      const publicOrder = {
        _id: order._id,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        itemsPrice: order.itemsPrice,
        taxPrice: order.taxPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paymentMethod: order.paymentMethod,
        paymentResult: order.paymentResult
      };
      return res.json(publicOrder);
    }

    // Include payment details for authenticated users
    res.json({
      ...order._doc,
      paymentMethod: order.paymentMethod,
      paymentResult: order.paymentResult
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    if (!hasRole(req.user, ['admin'])) {
      console.log('[OrderStatus] Forbidden: user is not admin', req.user && req.user.role);
      return res.status(403).json({ message: "Only admin can update order status" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('[OrderStatus] Order not found:', req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log('[OrderStatus] Updating order', req.params.id, 'from', order.orderStatus, 'to', req.body.status);
    const oldStatus = order.orderStatus;
    order.orderStatus = req.body.status || order.orderStatus;

    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      // If this is a COD order and it's being marked as delivered, reduce stock now
      if (order.paymentMethod === 'cod') {
        console.log('[OrderStatus] COD order delivered, reducing stock');
        try {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity }
            });
          }
        } catch (error) {
          console.error('[OrderStatus] Error reducing stock:', error);
          return res.status(500).json({ message: "Error reducing product stock" });
        }
      }
    }

    await order.save();
    console.log('[OrderStatus] Order saved. New status:', order.orderStatus);
    res.json(order);
  } catch (error) {
    console.error('[OrderStatus] Error updating order:', error);
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};
