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
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 3h-13C4.67 3 4 3.67 4 4.5v11C4 16.33 4.67 17 5.5 17h13c.83 0 1.5-.67 1.5-1.5v-11C20 3.67 19.33 3 18.5 3zm-1 11.5h-11v-9h11v9z"/>
          <path d="M7 8h8v1H7zM7 10h8v1H7z"/>
          {/* Steam lines */}
          <path d="M8 5.5c0-.28.22-.5.5-.5s.5.22.5.5-.22.5-.5.5-.5-.22-.5-.5zM10 5.5c0-.28.22-.5.5-.5s.5.22.5.5-.22.5-.5.5-.5-.22-.5-.5zM12 5.5c0-.28.22-.5.5-.5s.5.22.5.5-.22.5-.5.5-.5-.22-.5-.5z"/>
          {/* Coffee cup shape */}
          <path d="M6 7h10c.55 0 1 .45 1 1v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V8c0-.55.45-1 1-1z" fill="currentColor" opacity="0.3"/>
          {/* Handle */}
          <path d="M17 9v4c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'crypto donations',
      url: '#',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.369 1.106-1.229 1.416-2.316 1.196l-.567 2.277c.547.137.531.135.927.155.396.02.79-.057 1.103-.231l-.478 1.924c-.314.174-.708.251-1.104.231-.396-.02-.38-.018-.927-.155l-.15.602c-.123.492-.335.907-.636 1.244-.302.337-.686.6-1.153.788L11.816 16c.467-.188.851-.451 1.153-.788.301-.337.513-.752.636-1.244l.567-2.277c-.547-.137-.531-.135-.927-.155s-.79.057-1.103.231l.478-1.924c.314-.174.708-.251 1.104-.231.396.02.38.018.927.155l.15-.602c.123-.492.335-.907.636-1.244s.686-.6 1.153-.788L15.432 7.2c-.467.188-.851.451-1.153.788-.301.337-.513.752-.636 1.244l-.567 2.277c.547.137.531.135.927.155z"/>
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