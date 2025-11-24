import React from 'react';
import './SoundLibrary.css';

const SoundLibrary = ({ onBack, onSelectSound }) => {
  const sounds = [
    { id: 1, name: 'Капли дождя', category: 'nature', image: '🌧️' },
    { id: 2, name: 'Путешествие к Звездам', category: 'space', image: '🌌' },
    { id: 3, name: 'Кристаллы', category: 'meditation', image: '💎' },
    { id: 4, name: 'Глубокая Ночь', category: 'night', image: '🌙' },
    { id: 5, name: 'Глубокое раздумье', category: 'meditation', image: '🌍' },
    { id: 6, name: 'Под водой', category: 'water', image: '🌊' },
    { id: 7, name: 'Тибетская Чаша', category: 'meditation', image: '🎭' },
    { id: 8, name: 'Неистовая природа', category: 'nature', image: '🌿' },
    { id: 9, name: 'Дровяной Камин', category: 'cozy', image: '🔥' },
    { id: 10, name: 'Танец теней', category: 'mystery', image: '🌑' },
    { id: 11, name: 'Шум волн', category: 'water', image: '🌊' },
    { id: 12, name: 'Самопознание', category: 'meditation', image: '🌍' },
    { id: 13, name: 'Под Дождем', category: 'nature', image: '🌧️' },
    { id: 14, name: 'Камин', category: 'cozy', image: '🔥' },
    { id: 15, name: 'Ливень', category: 'nature', image: '🌧️' },
    { id: 16, name: 'Сад камней', category: 'zen', image: '🪨' },
    { id: 17, name: 'Лес', category: 'nature', image: '🌲' },
    { id: 18, name: 'Китайские Колокольчики', category: 'meditation', image: '🎐' },
    { id: 19, name: 'Ночная Птица', category: 'night', image: '🦉' },
    { id: 20, name: 'Зимний мотив', category: 'winter', image: '❄️' }
  ];

  const handleSoundSelect = (sound) => {
    onSelectSound(sound);
    onBack();
  };

  return (
    <div className="sound-library">
      <div className="header">
        <button className="back-btn" onClick={onBack}>✕</button>
        <h2>Фоновая музыка</h2>
        <button className="close-btn" onClick={onBack}>✕</button>
      </div>

      <div className="sounds-grid">
        {sounds.map((sound) => (
          <div 
            key={sound.id} 
            className="sound-item"
            onClick={() => handleSoundSelect(sound)}
          >
            <div className="sound-image">
              {sound.image}
            </div>
            <p className="sound-name">{sound.name}</p>
          </div>
        ))}
      </div>

      <div className="volume-control">
        <p>Фоновая музыка</p>
        <input type="range" className="volume-slider" min="0" max="100" defaultValue="50" />
      </div>
    </div>
  );
};

export default SoundLibrary;
