require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const { google } = require('googleapis');

const authRoutes = require('./routes/auth');

const app = express();
const port = 20052; // Unified port

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// === Backend Routes ===
app.use('/api/auth', authRoutes);

// === Google Calendar API Setup ===
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const serviceAccount = require(SERVICE_ACCOUNT_PATH);

const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = '9e948b3326cbe60aa907b04429a026d63515df86a205cf79cb637153a589aaff@group.calendar.google.com';

const classColorMap = {
  ME: '1',     // Blue
  BE: '2',     // Green
  CSSE: '3',   // Purple
  EE: '4',     // Red
  HSSA: '5',
  Other: '6'   // Slate
};

const colorMap = {
  '1': '#4285F4',  // ME - Blue
  '2': '#34A853',  // BE - Green
  '3': '#9C27B0',  // CSSE - Purple
  '4': '#EA4335',  // EE - Red
  '5': '#FBBC05',  // HSSA - Yellow
  '6': '#293f47',  // Other - Slate
};


// const TA = require('./models/ta');

app.get('/api/tas', async (req, res) => {
  try {
    const tas = await TA.find({}, 'name driveLink');
    res.json(tas);
  } catch (err) {
    console.error('Error fetching TAs:', err);
    res.status(500).json({ error: 'Failed to fetch TA list' });
  }
});

app.post('/api/tas', async (req, res) => {
  try {
    const { name, driveLink } = req.body;

    if (!name || !driveLink) {
      return res.status(400).json({ error: 'Name and drive link are required' });
    }

    const newTA = new TA({ name, driveLink });
    await newTA.save();

    res.json({ message: 'TA added successfully' });
  } catch (err) {
    console.error('Error adding TA:', err);
    res.status(500).json({ error: 'Failed to add TA' });
  }
});

// === Routes for Calendar Events ===

// POST /api/events - Create Event
app.post('/api/events', async (req, res) => {
  try {
    const { summary, start, end, className } = req.body;

    const event = {
      summary,
      start: { dateTime: new Date(start).toISOString(), timeZone: 'America/Indiana/Indianapolis' },
      end: { dateTime: new Date(end).toISOString(), timeZone: 'America/Indiana/Indianapolis' },
      description: `Class: ${className}`,
      colorId: classColorMap[className] || '5',
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    res.json({ message: 'Event created', link: response.data.htmlLink });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

const TA = require('./models/ta');

app.get('/api/tas', async (req, res) => {
  try {
    const tas = await TA.find({}, 'name driveLink');
    res.json(tas);
  } catch (err) {
    console.error('Error fetching TAs:', err);
    res.status(500).json({ error: 'Failed to fetch TA list' });
  }
});

// GET /api/events - List Events
app.get('/api/events', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const classNameFilter = req.query.className;

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    let events = response.data.items.map((e) => ({
      id: e.id,
      title: e.summary,
      start: e.start.dateTime || e.start.date,
      end: e.end.dateTime || e.end.date,
      color: colorMap[e.colorId] || '#F57C00',
      className: (e.description?.match(/Class:\s*(.+)/)?.[1] || '').trim(),
    }));

    if (classNameFilter) {
      events = events.filter(e => e.className === classNameFilter);
    }

    res.json({ events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// DELETE /api/events/:id - Delete Event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// === Serve React Frontend ===
app.use(express.static(path.join(__dirname, '../client/public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/calendar.html'));
});

// === MongoDB Connection & Server Startup ===
mongoose.connect('mongodb://localhost:20055/socialhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});
