import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface mt-12 border-t border-border-color">
      <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-text-secondary text-sm">
        <p className="font-semibold">Contact Information</p>
        <p>Phone: +92 326 8690126</p>
        <p>Address: Lahore, Pakistan</p>
        <p className="mt-4 opacity-70">© {new Date().getFullYear()} AR Inpainting Studio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;