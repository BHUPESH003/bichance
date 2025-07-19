import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

export default function FooterNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-center items-center py-3 md:hidden">
      <Link to="/" className="flex flex-col items-center text-red-600 hover:text-red-800">
        <FontAwesomeIcon icon={faHome} className="text-2xl" />
        <span className="text-xs font-bold mt-1">Home</span>
      </Link>
    </div>
  );
} 