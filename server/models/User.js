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
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don’t return password in queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  avatar: {
    url: { type: String },
    public_id: { type: String }, // for Cloudinary or similar
  },
  phone: { type: String },
  shippingAddresses: [addressSchema],
  defaultAddressIndex: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  socialProvider: {
    type: String,
    enum: ['google', 'facebook', 'email'],
    default: 'email',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
