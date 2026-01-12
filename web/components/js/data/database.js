const notes = [
  {
    id: '1',
    title: 'Первая заметка',
    content: 'Это пример первой заметки',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isCompleted: false,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Вторая заметка',
    content: 'Пример второй заметки с большим текстом',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    isCompleted: true,
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Третья заметка',
    content: 'Еще одна заметка для демонстрации',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
    isCompleted: false,
    priority: 'low'
  }
];

const notifications = [
  {
    id: 'notif-1',
    noteId: '1',
    email: 'user@example.com',
    reminderTime: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-15T12:00:00Z',
    status: 'pending'
  }
];

module.exports = {
  notes,
  notifications
};