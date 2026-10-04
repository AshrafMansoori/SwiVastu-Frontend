import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          SwiVastu
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">

          <a
            href="#home"
            className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
          >
            Home
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
          >
            How It Works
          </a>

          <a
            href="#categories"
            className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
          >
            Categories
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-gray-700 transition hover:text-blue-600"
          >
            About
          </a>

        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">

          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Get Started
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 px-6 py-5 md:hidden">

          <div className="flex flex-col gap-4">

            <a
              href="#home"
              onClick={() => setIsMenuOpen(false)}
              className="font-medium text-gray-700"
            >
              Home
            </a>

            <a
              href="#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="font-medium text-gray-700"
            >
              How It Works
            </a>

            <a
              href="#categories"
              onClick={() => setIsMenuOpen(false)}
              className="font-medium text-gray-700"
            >
              Categories
            </a>

            <a
              href="#about"
              onClick={() => setIsMenuOpen(false)}
              className="font-medium text-gray-700"
            >
              About
            </a>

            <div className="flex gap-3 border-t border-gray-200 pt-4">

              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-center text-sm font-semibold"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>

            </div>

          </div>

        </div>
      )}

    </nav>
  );
}

export default Navbar;