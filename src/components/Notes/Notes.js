import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import './Notes.css';

const Notes = ({ onBack }) => {
  const { user, addNote, updateNote, deleteNote } = useAuth();
  const { getPreviousView } = useNavigation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    mood: 'neutral'
  });

  if (!user) {
    return (
      <div className="notes-page">
        <div className="notes-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h2>Заметки</h2>
        </div>
        <div className="auth-required">
          <p>Войдите в аккаунт, чтобы создавать заметки</p>
        </div>
      </div>
    );
  }

  const notes = user.notes || [];
  const moods = [
    { value: 'happy', label: '😊 Радостно', color: '#4CAF50' },
    { value: 'calm', label: '😌 Спокойно', color: '#2196F3' },
    { value: 'neutral', label: '😐 Нейтрально', color: '#9E9E9E' },
    { value: 'sad', label: '😔 Грустно', color: '#FF9800' },
    { value: 'anxious', label: '😰 Тревожно', color: '#F44336' }
  ];

  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    if (editingId) {
      updateNote(editingId, {
        ...newNote,
        updatedAt: new Date().toISOString()
      });
      setEditingId(null);
    } else {
      addNote({
        ...newNote,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    setNewNote({ title: '', content: '', mood: 'neutral' });
    setIsCreating(false);
  };

  const handleEditNote = (note) => {
    setNewNote({
      title: note.title,
      content: note.content,
      mood: note.mood
    });
    setEditingId(note.id);
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setNewNote({ title: '', content: '', mood: 'neutral' });
    setIsCreating(false);
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodEmoji = (mood) => {
    return moods.find(m => m.value === mood)?.label.split(' ')[0] || '😐';
  };

  const getMoodColor = (mood) => {
    return moods.find(m => m.value === mood)?.color || '#9E9E9E';
  };

  return (
    <div className="notes-page">
      <div className="notes-header">
        <button className="back-btn" onClick={onBack} title={`Вернуться к ${getPreviousView() === 'home' ? 'главной' : getPreviousView()}`}>
          ←
        </button>
        <h2>Заметки</h2>
        <button 
          className="add-note-btn" 
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          +
        </button>
      </div>

      <div className="notes-content">
        {isCreating && (
          <div className="note-editor">
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              placeholder="Заголовок заметки..."
              className="note-title-input"
            />
            
            <div className="mood-selector">
              <label>Настроение:</label>
              <div className="mood-options">
                {moods.map(mood => (
                  <button
                    key={mood.value}
                    className={`mood-btn ${newNote.mood === mood.value ? 'active' : ''}`}
                    onClick={() => setNewNote({...newNote, mood: mood.value})}
                    style={{ backgroundColor: newNote.mood === mood.value ? mood.color : 'transparent' }}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              placeholder="Как вы себя чувствуете сегодня? Что происходит в вашей жизни?"
              className="note-content-input"
              rows="6"
            />

            <div className="note-editor-buttons">
              <button onClick={handleSaveNote} className="save-note-btn">
                {editingId ? 'Обновить' : 'Сохранить'}
              </button>
              <button onClick={handleCancelEdit} className="cancel-note-btn">
                Отмена
              </button>
            </div>
          </div>
        )}

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-notes">
              <div className="empty-notes-icon">📝</div>
              <h3>Пока нет заметок</h3>
              <p>Создайте первую заметку, чтобы отслеживать свои мысли и настроение</p>
              {!isCreating && (
                <button 
                  className="create-first-note-btn" 
                  onClick={() => setIsCreating(true)}
                >
                  Создать заметку
                </button>
              )}
            </div>
          ) : (
            notes
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <div className="note-mood" style={{ backgroundColor: getMoodColor(note.mood) }}>
                      {getMoodEmoji(note.mood)}
                    </div>
                    <div className="note-meta">
                      <h3>{note.title}</h3>
                      <p className="note-date">{formatDate(note.updatedAt)}</p>
                    </div>
                    <div className="note-actions">
                      <button 
                        onClick={() => handleEditNote(note)}
                        className="edit-note-btn"
                        disabled={isCreating}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="delete-note-btn"
                        disabled={isCreating}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="note-content">
                    {note.content}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
