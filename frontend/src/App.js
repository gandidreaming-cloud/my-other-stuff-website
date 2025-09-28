import React from 'react';
import './App.css';

function App() {
  const links = [
    {
      name: 'youtube',
      url: '#',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'tiktok',
      url: '#',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
        </svg>
      )
    },
    {
      name: 'instagram',
      url: '#',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81.675.771 1.066 1.638 1.134 2.67v.001c0 .014 0 .027.002.04.015.2.018.4.01.597-.014.32-.043.638-.085.952-.042.314-.098.625-.168.933a3.685 3.685 0 0 1-.22.72z"/>
        </svg>
      )
    },
    {
      name: 'buy me a coffee',
      url: '#',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.766-1.614A4.605 4.605 0 0 0 15.815 3h-6.624c-1.24 0-2.357.596-3.033 1.414A4.605 4.605 0 0 0 5.407 6.4l-.132.615A2.63 2.63 0 0 0 5 8.093v6.204c0 1.042.845 1.888 1.888 1.888h10.224c1.042 0 1.888-.846 1.888-1.888V8.093a2.63 2.63 0 0 0-.275-1.678zM12 15.667a2.333 2.333 0 1 1 0-4.666 2.333 2.333 0 0 1 0 4.666z"/>
          <circle cx="12" cy="13.334" r="1"/>
        </svg>
      )
    },
    {
      name: 'crypto donations',
      url: '#',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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