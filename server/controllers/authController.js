const bcrypt=require('bcrypt');
const User=require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async(req,res) =>
{
    try
    {
       const{name,email,password}=req.body;

       if(!name || !email || !password)
       {
           return res.status(400).json({message:'Name, email, and password are required'});

       }

      const existingUser = await User.findOne({ email });
      if(existingUser)
      {
        console.log('User with this email already exists');
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      // hash the password
      const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user' // Force all registrations to be regular users
        });
        await newUser.save();
        console.log('User registered successfully:', newUser);

        // Generate JWT token for immediate login after registration
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '10h' }
        );

        // Return user data without password
        const userData = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: userData
        });


    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }

};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // JWT generation
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Only include collegeId if it exists
    if (user.collegeId) {
      userData.collegeId = user.collegeId;
    }

    res.json({ 
      message: 'Login successful', 
      token,
      user: userData 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
