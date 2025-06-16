import User from '../models/User';


// Get all Users List
export const userLists = async (req, res) => {
  const users = await Users.find();
  res.json(users);
}

// Get Single user details
export const userDetails = async (req, res) => {
  const user = await Users.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User Not Found"})
  }
}

// Post create User
export const createUser = async (req, res) => {
  try {
    const user = "";
    const newUser = new User({ ...req.body });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  }catch (error) {
    res.status(500).json({ message: "Error creating User"});
  }
}

export const updateUser = async (req, res) => {
  try {
    let updateData = { ...req.body };
    const user = await User.findByIdAndUpdate(req,params.id, updateData, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found"});
    }
  } catch (error) {
    res.status(500).json({ message: "Error Updating User"})
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User id Deleted Succesfully!!!"});
  }catch (error) {
    res.status(500).json({ messge: "Error deleting User"})
  }
}






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