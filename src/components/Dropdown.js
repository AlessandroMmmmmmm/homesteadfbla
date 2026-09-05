import React, { useState } from 'react';
import Link from 'next/link';
import {AiOutlineCaretDown} from 'react-icons/ai'

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <div onMouseEnter={toggleDropdown} className='flex flex-row'>
        Projects <AiOutlineCaretDown className='mt-1 ml-[2px] scale-105'/>
      </div>

      <div
        className={`w-52 absolute mt-2 p-2 bg-black text-white border-none bg-opacity-90 rounded-b-lg shadow-lg transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onMouseLeave={closeDropdown}
      >
        <Link href="/projects/community-service">
          <span className="rounded-sm font-light block px-2 py-1 hover:text-warm-beige hover:bg-watermelon-red bg-opacity-5 ease-linear duration-150">Community Service</span>
        </Link>
        <Link href="/projects/partnership-with-business">
          <span className="rounded-sm font-light block px-2 py-1 hover:text-warm-beige hover:bg-watermelon-red bg-opacity-5 ease-linear duration-150">Partnership with Business</span>
        </Link>
        <Link href="/projects/software-ventures">
          <span className="rounded-sm font-light block px-2 py-1 hover:text-warm-beige hover:bg-watermelon-red bg-opacity-5 ease-linear duration-150">Software Ventures</span>
        </Link>
      </div>
    </div>
  );
};

export default DropdownMenu;