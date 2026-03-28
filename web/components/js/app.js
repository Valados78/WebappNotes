const API_BASE_URL = 'http://localhost:3000/api';

function setupNoteModal() {
  const noteForm = document.getElementById('noteForm');
  const modal = document.getElementById('noteModal');
  const closeBtn = document.querySelector('.close');
  const cancelBtn = document.getElementById('cancelBtn');
  const createBtn = document.getElementById('createNoteBtn');
  const emailCheckbox = document.getElementById('emailReminder');
  const emailField = document.getElementById('emailField');

  if (!noteForm || !modal) {
    console.error('Не найдены элементы формы или модального окна');
    return;
  }

  console.log('Инициализация модального окна для заметок...');

  noteForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const noteInput = document.getElementById('noteInput');
    if (!noteInput) return;
    
    const noteTitle = noteInput.value.trim();
    if (!noteTitle) {
      alert('Пожалуйста, введите название заметки');
      return;
    }

    const modalTitle = document.getElementById('modalNoteTitle');
    if (modalTitle) {
      modalTitle.textContent = noteTitle;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    
    document.getElementById('reminderDate').value = today;
    document.getElementById('reminderTime').value = time;
    document.getElementById('emailReminder').checked = false;
    document.getElementById('email').value = '';
    
    if (emailField) {
      emailField.style.display = 'none';
    }

    modal.style.display = 'block';
    console.log('Показано модальное окно для заметки:', noteTitle);
  });

  if (emailCheckbox && emailField) {
    emailCheckbox.addEventListener('change', function() {
      emailField.style.display = this.checked ? 'block' : 'none';
    });
  }

  function closeModal() {
    modal.style.display = 'none';
    document.getElementById('noteInput').value = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  if (createBtn) {
    createBtn.addEventListener('click', async function() {
      const noteTitle = document.getElementById('modalNoteTitle').textContent;
      const reminderDate = document.getElementById('reminderDate').value;
      const reminderTime = document.getElementById('reminderTime').value;
      const emailReminder = document.getElementById('emailReminder').checked;
      const email = document.getElementById('email').value;

      if (!reminderDate) {
        alert('Пожалуйста, выберите дату напоминания');
        return;
      }

      if (!reminderTime) {
        alert('Пожалуйста, выберите время напоминания');
        return;
      }

      if (emailReminder && !email) {
        alert('Пожалуйста, введите email для напоминания');
        return;
      }

      if (emailReminder && email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Пожалуйста, введите корректный email');
          return;
        }
      }

      const noteData = {
        title: noteTitle,
        date: reminderDate,
        time: reminderTime,
        emailReminder: emailReminder,
        email: emailReminder ? email : null
      };

      try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData)
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log('Заметка создана:', result);
          
          alert(`Заметка "${noteTitle}" успешно создана!\nДата напоминания: ${reminderDate} ${reminderTime}\n${
            emailReminder ? `Напоминание будет отправлено на: ${email}` : ''
          }`);
          
          closeModal();
          
          document.getElementById('noteForm').reset();
          
          if (typeof loadNotes === 'function') {
            loadNotes();
          }
          
          if (typeof loadManageNotes === 'function') {
            loadManageNotes();
          }
          
        } else {
          alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при создании заметки. Проверьте подключение к серверу.');
      }
    });
  }
}

async function loadNotes() {
    const notesContainer = document.getElementById('notesList');
    if (!notesContainer) return;
    
    try {
        notesContainer.innerHTML = '<div class="loading">Загрузка заметок...</div>';
        
        const response = await fetch(`${API_BASE_URL}/notes`);
        const result = await response.json();
        
        let notes = [];
        if (Array.isArray(result)) {
            notes = result;
        } else if (result.notes && Array.isArray(result.notes)) {
            notes = result.notes;
        }
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<div class="empty-state">📝 Пока нет заметок. Создайте первую заметку!</div>';
            return;
        }
        
        notesContainer.innerHTML = notes.map((note, index) => {
            const colorIndex = index % 6;
            const statusText = note.status === 'active' ? 'Активна' : 'Завершена';
            const statusClass = note.status === 'active' ? 'active' : 'completed';
            const formattedDate = note.date ? formatDate(note.date) : 'Дата не указана';
            
            return `
                <div class="note-card color-${colorIndex}" data-id="${note.id}">
                    <div class="note-status ${statusClass}">${statusText}</div>
                    <div class="note-title">${escapeHtml(note.title)}</div>
                    <div class="note-datetime">
                        ${formattedDate} ${note.time || ''}
                    </div>
                    ${note.emailReminder && note.email ? `
                        <div class="note-email">
                            ${escapeHtml(note.email)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Ошибка при загрузке заметок:', error);
        notesContainer.innerHTML = '<div class="empty-state">❌ Ошибка при загрузке заметок. Проверьте подключение к серверу.</div>';
    }
}

async function loadManageNotes() {
    const notesContainer = document.getElementById('manageNotesList');
    if (!notesContainer) return;
    
    try {
        notesContainer.innerHTML = '<div class="loading">Загрузка заметок...</div>';
        
        const response = await fetch(`${API_BASE_URL}/notes`);
        const result = await response.json();
        
        let notes = [];
        if (Array.isArray(result)) {
            notes = result;
        } else if (result.notes && Array.isArray(result.notes)) {
            notes = result.notes;
        }
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<div class="empty-state">📝 Нет заметок для управления</div>';
            return;
        }
        
        notesContainer.innerHTML = notes.map((note, index) => {
            const colorIndex = index % 6;
            const statusText = note.status === 'active' ? 'Активна' : 'Завершена';
            const statusClass = note.status === 'active' ? 'active' : 'completed';
            const formattedDate = note.date ? formatDate(note.date) : 'Дата не указана';
            
            return `
                <div class="note-card color-${colorIndex}" data-id="${note.id}">
                    <div class="note-status ${statusClass}">${statusText}</div>
                    <div class="note-title">${escapeHtml(note.title)}</div>
                    <div class="note-datetime">
                        ${formattedDate} ${note.time || ''}
                    </div>
                    ${note.emailReminder && note.email ? `
                        <div class="note-email">
                            ${escapeHtml(note.email)}
                        </div>
                    ` : ''}
                    <button class="delete-btn" onclick="deleteNote('${note.id}')">Удалить</button>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Ошибка при загрузке заметок:', error);
        notesContainer.innerHTML = '<div class="empty-state">❌ Ошибка при загрузке заметок. Проверьте подключение к серверу.</div>';
    }
}

async function deleteNote(noteId) {
    if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Заметка успешно удалена!');
            
            if (typeof loadManageNotes === 'function') {
                loadManageNotes();
            }
            
            if (typeof loadNotes === 'function') {
                loadNotes();
            }
        } else {
            alert(`Ошибка: ${result.error || 'Не удалось удалить заметку'}`);
        }
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Произошла ошибка при удалении заметки');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setupNoteModal();
    
    if (document.getElementById('notesList')) {
        loadNotes();
    }
    
    if (document.getElementById('manageNotesList')) {
        loadManageNotes();
    }
  });
} else {
  setupNoteModal();
  
  if (document.getElementById('notesList')) {
      loadNotes();
  }
  
  if (document.getElementById('manageNotesList')) {
      loadManageNotes();
  }
}