import React from 'react';

export default function CoachingIndicator({ message }) {
  return (
    <div className="coaching-indicator slide-up">
      <span style={{ fontSize: '1.5rem' }}>💡</span>
      <span>{message}</span>
    </div>
  );
}
