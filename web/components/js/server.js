const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { notes, notifications } = require('./data/database');

const app = express();
const PORT = 3000;

// пока сделаю такую имитацию БД, может в конце переделаю что-то
let notesDB = [...notes];
let notificationsDB = [...notifications];

// обработка запросов перед путями
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'pages')));


// почтовый клиент
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'test@example.com',
    pass: 'test123'
  }
});



// запуск сервера и логи
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log('API доступен по адресам:');
  console.log('  GET    /api/notes');
  console.log('  POST   /api/notes');
  console.log('  PUT    /api/notes/:id');
  console.log('  DELETE /api/notes/:id');
  console.log('  POST   /api/notifications');
  console.log('  GET    /api/notifications');
});