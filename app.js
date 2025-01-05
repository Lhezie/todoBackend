const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/Users');
const Task = require('./models/Task');
const { authenticate } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 5030;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
   
    // useNewUrlParser: true,
   
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// Middleware
app.set('view engine', 'ejs');
app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For URL-encoded form parsing
app.use(express.static('public'));

// Session & Flash
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Render signin page
app.get('/auth/signin', (req, res) => res.render('auth/login', { message: req.flash('error') }));


passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Incorrect email' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Custom Middleware



// Routes
app.get('/', (req, res) => res.redirect('/auth/signin'));


// Signup Route
app.post('/auth/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required: firstname, lastname, email, password' });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Respond with success
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error registering user', details: err.message });
  }
});

// Signin Route
app.post('/auth/signin', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // Return JSON response for API clients like Postman
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // Differentiate response for API clients and browser redirects
      if (req.headers.accept === 'application/json') {
        return res.status(200).json({ message: 'Login successful', user });
      }

      res.redirect('/tasks'); // Default redirect for browser workflows
    });
  })(req, res, next);
});


// Logout Route
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/auth/signin');
  });
});



// Task Routes
app.get('/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.render('tasks/index', { tasks, user: req.user });
  } catch (err) {
    res.status(500).send('Error fetching tasks');
  }
});

app.post('/tasks', authenticate, async (req, res) => {
  try {
    const task = new Task({ description: req.body.description, user: req.user.id });
    await task.save();
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error creating task');
  }
});


app.post('/tasks/:id/update', authenticate, async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { state: req.body.state });
  res.redirect('/tasks');
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
