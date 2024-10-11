import { useState } from "react";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Done", path: "/done" },
  ];

  return (
    <nav className="bg-white border-b border-gray-300 px-4 sm:px-10 py-4 shadow-sm shadow-gray-100">
      <div className="mx-auto flex items-center">
        <Link to="/" className=" text-2xl font-bold mr-6">
          Todo app
        </Link>
        <div className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className=" hover:text-gray-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <button
          className="md:hidden  focus:outline-none ml-auto"
          onClick={toggleNavbar}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto" },
          closed: { opacity: 0, height: 0 },
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden"
      >
        <div className="flex flex-col items-center space-y-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className=" hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
