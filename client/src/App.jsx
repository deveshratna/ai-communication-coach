import React, { useState } from 'react';
import Landing from './components/Landing';
import ModeSelector from './components/ModeSelector';
import LiveSession from './components/LiveSession';
import PostSessionDashboard from './components/PostSessionDashboard';
import SessionHistory from './components/SessionHistory';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentSession, setCurrentSession] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const handleStartSession = (mode) => {
    setCurrentSession({ mode, startTime: Date.now() });
    setCurrentView('live');
  };

  const handleEndSession = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setCurrentView('post');
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing onStart={() => setCurrentView('mode_select')} />;
      case 'mode_select':
        return <ModeSelector onSelectMode={handleStartSession} />;
      case 'live':
        return (
          <LiveSession 
            sessionData={currentSession} 
            onEnd={handleEndSession} 
          />
        );
      case 'post':
        return (
          <PostSessionDashboard 
            analysis={currentAnalysis}
            onTryAgain={() => handleStartSession(currentSession?.mode || 'conversation')}
            onNewSession={() => setCurrentView('mode_select')}
            onHome={() => setCurrentView('landing')}
          />
        );
      case 'history':
        return <SessionHistory onBack={() => setCurrentView('landing')} />;
      default:
        return <Landing onStart={() => setCurrentView('mode_select')} />;
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand text-gradient" onClick={() => setCurrentView('landing')} style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
          Cadence Studio
        </div>
        {currentView !== 'live' && (
          <div className="nav-links">
            <div 
              className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
              onClick={() => setCurrentView('landing')}
            >
              Home
            </div>
            <div 
              className={`nav-link ${currentView === 'mode_select' ? 'active' : ''}`}
              onClick={() => setCurrentView('mode_select')}
            >
              Agents
            </div>
            <div 
              className={`nav-link ${currentView === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentView('history')}
            >
              History
            </div>
          </div>
        )}
      </nav>
      {renderView()}
    </div>
  );
}

export default App;
