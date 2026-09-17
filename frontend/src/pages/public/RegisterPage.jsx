import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaHeartbeat, FaCalendarAlt, FaLanguage, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const RegisterPage = () => {
  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    language_preference: 'English',
    address: '',
    emergency_contact: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password || !formData.phone) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const res = await registerUser(formData);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError('Registration failed. Username or email may already be taken.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-4">
        
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Create Patient Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Join SevaHealth for digital prescription parsing & doctor discovery</p>
        </div>

        <Card className="p-5 sm:p-6 bg-white dark:bg-[#172033] border border-slate-200/80 dark:border-slate-700 shadow-xl space-y-4 rounded-3xl">
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message="Registration Successful! Redirecting to login..." />}

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Username"
                placeholder="e.g. ramesh_kumar"
                icon={FaUser}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Create password"
                icon={FaLock}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {/* Personal Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="e.g. Ramesh"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                placeholder="e.g. Kumar"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="ramesh@gmail.com"
                icon={FaEnvelope}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Mobile Phone Number"
                placeholder="e.g. 9876543210"
                icon={FaPhone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Date of Birth"
                type="date"
                icon={FaCalendarAlt}
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Language *
                </label>
                <select
                  value={formData.language_preference}
                  onChange={(e) => setFormData({ ...formData, language_preference: e.target.value })}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Marathi">Marathi</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* Address / Village */}
            <Input
              label="Village / Residence Address"
              placeholder="e.g. Sundarpur Village, Dist. Varanasi"
              icon={FaMapMarkerAlt}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            {/* Emergency Contact */}
            <Input
              label="Emergency Family Phone"
              placeholder="e.g. 9812345678 (Son / Brother)"
              icon={FaPhoneAlt}
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
            />

            <Button type="submit" variant="mint" size="lg" fullWidth loading={loading} className="py-2.5 font-bold text-xs rounded-xl mt-2">
              Create Patient Account
            </Button>
          </form>

        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 font-black hover:underline">
            Sign In Here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
