import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/login', { state: { successMessage: 'Account created successfully. Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Get started</p>
        <h1>Create your CareerForge account</h1>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>
          <label>
            Confirm Password
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </label>
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
