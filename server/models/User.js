import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const addressSchema = new mongoose.Schema({
  fullName: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
  },
  // It is crucial to check the email if it is duplicate or not for uniqueness in data
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [ //Validation can be done in frontend also 
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },

  // 👤 Role: admin or customer
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },

  // ✅ Approval for admins only
  isApproved: {
    type: Boolean,
    default: function () {
      return this.role === 'admin' ? false : true;
    },
  },

  avatar: {
    url: { type: String },
    public_id: { type: String },
  },
  phone: { type: String },

  // 🏠 Shipping addresses
  shippingAddresses: [addressSchema],
  defaultAddressIndex: { type: Number, default: 0 },

  // 📩 Verification and social login
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  socialProvider: {
    type: String,
    default: 'email',
  },

  refreshTokens: [{ type: String }],

  // Wishlist: array of product ObjectIds
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // 🔐 Reset password
  resetPasswordToken: String,
  resetPasswordExpires: Date,

}, {
  timestamps: true,
});

// 🔐 Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔐 Password comparison
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

// Seller status points like if he/she is verified or not, how many products he/she has, etc.
// You can add more fields as per your requirements,
// score of seller in case of selling products, listing techniques and improvement suggestions, etc.
// You can also add fields for seller ratings, number of sales, etc. if you want to track seller performance.

// Only admin can approve or disapprove a user first admin finds the user and then approves then
// if user is approved for admin then only he/she can access admin features there will be no option for user to approve himself/herself