const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/style', express.static(path.join(__dirname, 'pages', 'style')));
app.use('/app.js', express.static(path.join(__dirname, 'app.js')));

const { notes, notifications } = require('./data/database');
let notesDB = [...notes];
let notificationsDB = [...notifications];

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'test@example.com',
    pass: 'test123'
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'main.html'));
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  const validPages = ['notes.html', 'notesList.html', 'manage.html', 'main.html'];
  
  if (validPages.includes(page)) {
    res.sendFile(path.join(__dirname, 'pages', page));
  } else {
    res.status(404).send('Page not found');
  }
});

app.post('/api/notes', (req, res) => {
  console.log('Получен запрос на создание заметки:', req.body);
  
  const { title, date, time, emailReminder, email } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Название заметки обязательно' });
  }

  const newNote = {
    id: uuidv4(),
    title: title,
    date: date || null,
    time: time || null,
    emailReminder: emailReminder || false,
    email: emailReminder ? email : null,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  notesDB.push(newNote);
  
  console.log('Создана новая заметка:', newNote);
  console.log('Всего заметок в базе:', notesDB.length);

  if (emailReminder && email) {
    const newNotification = {
      id: uuidv4(),
      noteId: newNote.id,
      email: email,
      title: `Напоминание: ${title}`,
      message: `Не забудьте о: ${title}. Напоминание на ${date} в ${time}`,
      date: date,
      time: time,
      createdAt: new Date().toISOString(),
      sent: false
    };
    
    notificationsDB.push(newNotification);
    
    console.log(`Создано напоминание для заметки: ${title}`);
  }

  res.status(201).json({
    success: true,
    message: 'Заметка успешно создана',
    note: newNote
  });
});

app.get('/api/notes', (req, res) => {
  res.json({
    success: true,
    count: notesDB.length,
    notes: notesDB
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  console.log('Запрос на удаление заметки:', noteId);
  
  const noteIndex = notesDB.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Заметка не найдена' });
  }
  
  const deletedNote = notesDB[noteIndex];
  notesDB.splice(noteIndex, 1);
  
  notificationsDB = notificationsDB.filter(notif => notif.noteId !== noteId);
  
  console.log('Заметка удалена:', deletedNote.title);
  console.log('Осталось заметок:', notesDB.length);
  
  res.json({
    success: true,
    message: 'Заметка успешно удалена',
    note: deletedNote
  });
});

app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    count: notificationsDB.length,
    notifications: notificationsDB
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log('API доступен по адресам:');
  console.log('  GET    /api/notes');
  console.log('  POST   /api/notes');
  console.log('  DELETE /api/notes/:id');
  console.log('  GET    /api/notifications');
  console.log('\nОткройте в браузере: http://localhost:3000');
});