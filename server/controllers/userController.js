import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';


// Get all Users List
export const userLists = async (req, res) => {
  const users = await User.find();
  res.json(users);
}

// Get Single user details
export const userDetails = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User Not Found" })
  }
}

// Post create User
export const createUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Conflict Email Already Exists!!!" });
    }
    const newUser = new User({ ...req.body, email });
    const savedUser = await newUser.save();

    // Generate Tokens
    const accessToken = generateAccessToken(savedUser)
    const refreshToken = generateRefreshToken(savedUser)

    // Optionally set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    savedUser.refreshTokens = savedUser.refreshTokens || [];
    savedUser.refreshTokens.push(refreshToken);
    await savedUser.save();

    res.status(201).json({
      message: 'User created successfully',
      savedUser,
      accessToken,
      savedUser: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating User", error: error.message });
  }
}

export const updateUser = async (req, res) => {
  try {
    let updateData = { ...req.body };
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error Updating User" })
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User id Deleted Succesfully!!!" });
  } catch (error) {
    res.status(500).json({ messge: "Error deleting User" })
  }
}

export const deleteUserDetails = async (req, res) => {
  try {
    // Block users from changing protected fields
    delete req.body.role;
    delete req.body.email;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated/deleted successfully!", updatedUser });

  } catch (error) {
    res.status(500).json({ message: "Error updating/deleting User", error: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Optionally set refresh token in HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.status(200).json({
    message: "Login successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};



// PUT /admin/approve/:id
export const approveAdmin = async (req, res) => {
  const currentAdmin = req.user;

  // Only allow approved admins to approve others
  if (currentAdmin.role !== 'admin' || !currentAdmin.isApproved) {
    return res.status(403).json({ message: 'Only approved admins can approve others' });
  }

  const userToApprove = await User.findById(req.params.id);
  if (!userToApprove || userToApprove.role !== 'admin') {
    return res.status(404).json({ message: 'Admin not found' });
  }

  userToApprove.isApproved = true;
  await userToApprove.save();

  res.status(200).json({ message: 'Admin approved successfully' });
};


export const authorizeAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin' || !req.user.isApproved) {
    return res.status(403).json({ message: 'Only approved admins can list products' });
  }
  next();
};