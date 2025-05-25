import { useState } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullname: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("users/signup", formData);
      navigate("/login");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="w-96 p-4 bg-gray-800 rounded-lg">
        <input
          className="input-field"
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          className="input-field"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          className="input-field"
          type="text"
          name="fullname"
          placeholder="Full Name"
          onChange={handleChange}
        />
        <input
          className="input-field"
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          onChange={handleChange}
        />
        <input
          className="input-field"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
    </div>
  );
};

export default Signup;
