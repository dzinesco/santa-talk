import React, { useState } from 'react';
import SnowGlobe from './components/SnowGlobe';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="App">
      {showChat ? (
        <ChatInterface onBack={() => setShowChat(false)} />
      ) : (
        <div className="snow-globe-container">
          <SnowGlobe />
          <button 
            className="chat-button"
            onClick={() => setShowChat(true)}
          >
            Chat with Santa
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
