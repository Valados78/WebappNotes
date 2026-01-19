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

// статические файлы
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/style', express.static(path.join(__dirname, 'pages', 'style')));
app.use('/app.js', express.static(path.join(__dirname, 'app.js')));

// имитация базы данных
const { notes, notifications } = require('./data/database');
let notesDB = [...notes];
let notificationsDB = [...notifications];

// почтовый клиент (имитация) ПОКА ЧТО ТАК
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'test@example.com',
    pass: 'test123'
  }
});

// маршрут для главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'main.html'));
});

// маршрут для других страниц
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const validPages = ['notes.html', 'notesList.html', 'manage.html', 'main.html'];
  
  if (validPages.includes(page)) {
    res.sendFile(path.join(__dirname, 'pages', page));
  } else {
    res.status(404).send('Page not found');
  }
});

// API маршруты
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

  // если включено напоминание на почту
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

app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    count: notificationsDB.length,
    notifications: notificationsDB
  });
});

// запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log('API доступен по адресам:');
  console.log('  GET    /api/notes');
  console.log('  POST   /api/notes');
  console.log('  GET    /api/notifications');
  console.log('\nОткройте в браузере: http://localhost:3000');
  console.log('Для создания заметки: http://localhost:3000/notes.html');
});