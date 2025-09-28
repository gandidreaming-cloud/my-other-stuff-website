import React from 'react';
import './App.css';

function App() {
  const links = [
    {
      name: 'youtube',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'tiktok',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
        </svg>
      )
    },
    {
      name: 'instagram',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'paypal',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81.675.771 1.066 1.638 1.134 2.67v.001c0 .014 0 .027.002.04.015.2.018.4.01.597-.014.32-.043.638-.085.952-.042.314-.098.625-.168.933a3.685 3.685 0 0 1-.22.72z"/>
        </svg>
      )
    },
    {
      name: 'buy me a coffee',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          {/* Coffee cup */}
          <path d="M2 21h17l-2-9H4l-2 9zM20 3H4v5c0 2 2 4 4 4h6c2 0 4-2 4-4V3z" fill="currentColor" opacity="0.8"/>
          <path d="M20 7h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2" stroke="currentColor" strokeWidth="1" fill="none"/>
          {/* Steam */}
          <path d="M7 1v2M10 1v2M13 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      name: 'crypto donations',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="12" fill="currentColor"/>
          <path d="M17.12 10.78c.14-1.08-.66-1.66-1.79-2.04l.37-1.46-1.08-.25-.36 1.42c-.28-.07-.57-.14-.86-.2l.36-1.43-1.08-.25-.37 1.46c-.23-.05-.46-.1-.68-.16v-.02l-1.49-.34-.29 1.1s.8.18.78.19c.44.11.52.4.5.63l-.5 1.99c.03.01.07.02.11.04-.04-.01-.08-.02-.11-.04l-.7 2.8c-.05.13-.19.32-.5.25.01.02-.78-.19-.78-.19l-.53 1.18 1.4.32c.26.07.52.14.77.2l-.37 1.48 1.08.25.37-1.46c.29.08.57.15.85.22l-.37 1.45 1.08.25.37-1.48c1.53.29 2.68.17 3.16-1.21.39-1.11-.02-1.75-.82-2.17.58-.13 1.02-.52 1.13-1.32zm-2.02 2.83c-.28 1.1-2.14.51-2.75.36l.49-1.95c.61.15 2.54.46 2.26 1.59zm.28-2.85c-.25.99-1.79.49-2.29.37l.44-1.77c.5.12 2.11.35 1.85 1.4z" fill="white"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-white text-4xl font-light text-center mb-12">
          gandi's links
        </h1>
        
        {/* Links */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className="flex items-center justify-center w-full p-4 bg-transparent border border-gray-700 rounded-lg text-white hover:bg-gray-900 hover:border-gray-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center space-x-3">
                {link.icon}
                <span className="text-lg font-light">{link.name}</span>
              </div>
            </a>
          ))}
        </div>
        
        {/* Footer */}
        <p className="text-gray-500 text-sm text-center mt-16">
          © 2025 gandi's links
        </p>
      </div>
    </div>
  );
}

export default App;