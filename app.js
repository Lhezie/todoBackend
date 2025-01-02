const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const Task = require('./models/Task');
const User = require('./models/Users');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

// Load environment variables
dotenv.config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 5030;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session & Flash
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Passport Config
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: 'Incorrect username' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Incorrect password' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Custom Middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// Routes
app.get('/', (req, res) => res.redirect('/login'));

// Auth Routes
app.get('/login', (req, res) => res.render('auth/login', { message: req.flash('error') }));
app.post('/login', passport.authenticate('local', {
  successRedirect: '/tasks',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', (req, res) => res.render('auth/register'));
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ username: req.body.username, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// Task Routes
app.get('/tasks', isAuthenticated, async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.render('tasks/index', { tasks, user: req.user });
});

app.post('/tasks', isAuthenticated, async (req, res) => {
  const task = new Task({ description: req.body.description, user: req.user.id });
  await task.save();
  res.redirect('/tasks');
});

app.post('/tasks/:id/update', isAuthenticated, async (req, res) => {
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
