import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 2) return 'Username must be at least 2 characters';
        if (value.length > 30) return 'Username must be less than 30 characters';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Username can only contain letters and numbers (no spaces)';
        if (/^\d+$/.test(value)) return 'Username cannot be only numbers';
        return null;

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email is too long';
        return null;

      case 'password':
        if (!value) return 'Password is required';
        if (isLogin) return null; // For login, just check if it exists
        
        // For registration, check all requirements
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 128) return 'Password is too long';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/\d/.test(value)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
        if (/\s/.test(value)) return 'Password cannot contain spaces';
        
        return null;

      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = isLogin ? ['email', 'password'] : ['username', 'email', 'password'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Additional email format check
    if (formData.email && !newErrors.email) {
      const emailParts = formData.email.split('@');
      if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1]) {
        newErrors.email = 'Invalid email format';
      }
    }

    return newErrors;
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
    setErrors({});
    setFieldTouched({});
    setSuccessMessage('');
    setPasswordStrength(0);
    setShowPasswordRequirements(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent certain characters in username
    if (name === 'username') {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setFormData({ ...formData, [name]: sanitizedValue });
    } else if (name === 'email') {
      // Trim spaces and convert to lowercase
      setFormData({ ...formData, [name]: value.trim().toLowerCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Real-time password strength checking
    if (name === 'password' && !isLogin) {
      const { strength } = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Clear errors for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null, general: null });
    }
    setSuccessMessage('');
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setFieldTouched({ ...fieldTouched, [name]: true });
    
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage('');
    setIsSubmitting(true);

    // Mark all fields as touched
    const fieldsToTouch = isLogin ? ['email', 'password'] : ['username', 'email', 'password'];
    const touchedFields = {};
    fieldsToTouch.forEach(field => touchedFields[field] = true);
    setFieldTouched(touchedFields);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setErrors({});

    try {
      const url = isLogin
        ? 'https://localhost:7169/api/User/Login'
        : 'https://localhost:7169/api/User/Register';

      const bodyData = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
        credentials: 'include',
      });

      if (response.ok) {
        if (isLogin) {
          // Fetch user data from /api/User/me after successful login
          const userResponse = await fetch('https://localhost:7169/api/User/me', {
            credentials: 'include',
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            const normalizedUser = {
              username: user.username || user.name || "",
              role: user.role || "User",
            };
            
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            toast.success('Login successful!');

            setTimeout(() => {
              window.location.href = '/Dashboard';
            }, 1000);
          } else {
            throw new Error("Failed to fetch user data after login");
          }
        } else {
          toast.success('Registration successful! Please login now.');
          setSuccessMessage('Registration successful! You can now sign in.');
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMessage('');
            setFormData({ username: '', email: '', password: '' });
            setFieldTouched({});
          }, 2000);
        }

        setErrors({});
      } else {
        const errorMessage = await response.text();
        toast.error(errorMessage);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = 'Unable to connect to the server. Please try again.';
      toast.error(errorMsg);
      setErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'https://localhost:7285/api/User/login-google';
  };

  const getFieldStatus = (fieldName) => {
    if (!fieldTouched[fieldName]) return 'default';
    if (errors[fieldName]) return 'error';
    if (formData[fieldName]) return 'success';
    return 'default';
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-400';
      case 2: return 'bg-orange-400';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-blue-400';
      case 5: return 'bg-green-400';
      default: return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
    }
  };

  const { checks } = checkPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="absolute inset-0 bg-grid-slate-100 bg-[size:20px_20px] opacity-20"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 p-10 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex bg-gradient-to-r from-slate-100/90 to-blue-100/90 backdrop-blur-sm rounded-xl p-1.5 mb-8 border border-slate-200/50 shadow-inner">
          <button
            onClick={() => !isLogin && toggleForm()}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
              isLogin
                ? 'bg-white text-blue-700 shadow-lg border border-blue-100 transform scale-105'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Sign In
            </div>
          </button>
          <button
            onClick={() => isLogin && toggleForm()}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
              !isLogin
                ? 'bg-white text-blue-700 shadow-lg border border-blue-100 transform scale-105'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Register
            </div>
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-600 text-sm">
            {isLogin ? 'Sign in to continue to your dashboard' : 'Join us and start your journey'}
          </p>
        </div>

        {isLogin && (
          <div className="mb-6">
            <button
              onClick={handleGoogleSignup}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-lg hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 group transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-slate-700 group-hover:text-slate-800">
                  Continue with Google
                </span>
              </div>
            </button>

            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-slate-300"></div>
              <div className="px-4 text-sm text-slate-500 bg-white rounded-full border border-slate-200">or</div>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-medium shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </div>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 rounded-xl text-center font-medium shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5" />
              {errors.general}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-slate-700 font-semibold text-sm" htmlFor="username">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${getFieldStatus('username') === 'error' ? 'text-red-400' : getFieldStatus('username') === 'success' ? 'text-green-400' : 'text-slate-400'}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                    getFieldStatus('username') === 'error' 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : getFieldStatus('username') === 'success'
                      ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                  }`}
                  placeholder="Enter username (letters and numbers only)"
                  autoComplete="username"
                  maxLength={30}
                />
                {getFieldStatus('username') === 'success' && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.username && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold text-sm" htmlFor="email">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${getFieldStatus('email') === 'error' ? 'text-red-400' : getFieldStatus('email') === 'success' ? 'text-green-400' : 'text-slate-400'}`} />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  getFieldStatus('email') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                    : getFieldStatus('email') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
                placeholder="Enter your email address"
                autoComplete="email"
              />
              {getFieldStatus('email') === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>
            {errors.email && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold text-sm" htmlFor="password">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${getFieldStatus('password') === 'error' ? 'text-red-400' : getFieldStatus('password') === 'success' ? 'text-green-400' : 'text-slate-400'}`} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                onFocus={() => !isLogin && setShowPasswordRequirements(true)}
                className={`w-full pl-12 pr-16 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  getFieldStatus('password') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                    : getFieldStatus('password') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
                placeholder="Enter your password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-blue-500 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {!isLogin && formData.password && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Password strength:</span>
                  <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!isLogin && showPasswordRequirements && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-sm text-slate-600 mb-2 font-medium">Password must contain:</div>
                <div className="space-y-1 text-sm">
                  {[
                    { key: 'length', text: 'At least 8 characters', check: formData.password.length >= 8 },
                    { key: 'uppercase', text: 'One uppercase letter (A-Z)', check: checks.uppercase },
                    { key: 'lowercase', text: 'One lowercase letter (a-z)', check: checks.lowercase },
                    { key: 'number', text: 'One number (0-9)', check: checks.number },
                    { key: 'special', text: 'One special character (!@#$%^&*)', check: checks.special },
                  ].map(({ key, text, check }) => (
                    <div key={key} className={`flex items-center gap-2 ${check ? 'text-green-600' : 'text-slate-500'}`}>
                      {check ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.password && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </div>
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          By {isLogin ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default AuthForm;