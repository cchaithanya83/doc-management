import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { logout } = useAuth();
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <nav className="bg-gray-800 p-4 flex justify-between">
      <div className="text-white text-xl font-bold">DocManager</div>
      <div>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-white px-4">Dashboard</Link>
            <Link to="/upload" className="text-white px-4">Upload</Link>
            <button onClick={logout} className="text-red-400 px-4">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white px-4">Login</Link>
            <Link to="/signup" className="text-white px-4">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
