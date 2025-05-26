import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Adjust path as per your project

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // Assuming logout returns a Promise
      localStorage.removeItem("token"); // Clear token
      setTimeout(() => {
        navigate("/login"); // Redirect after a short delay for transition
        setIsLoggingOut(false);
      }, 1000); // 1-second delay for loader visibility
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 flex justify-between items-center transition-all duration-300">
        <div className="text-2xl font-bold text-gray-800">DocManager</div>
        <div className="flex items-center space-x-6">
          {isLoggingOut ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-600">Logging out...</span>
            </div>
          ) : isAuthenticated ? (
            <>
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Upload
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>
      {/* Placeholder to prevent content from being hidden under the fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
