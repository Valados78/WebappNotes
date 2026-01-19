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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNoteModal);
} else {
  setupNoteModal();
}