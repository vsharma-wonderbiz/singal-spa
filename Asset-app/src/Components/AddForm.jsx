
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, X, AlertCircle, Check } from 'lucide-react';
import api from '../Api/Api';

const AddForm = ({ onSuccess }) => {

  const token=localStorage.getItem('token');
  // console.log(token);
  const Loginuser=localStorage.getItem('user');
  // console.log(Loginuser)

  const [formData, setFormData] = useState({
    name: '',
    parentAssetId: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    parentAssetId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', parentAssetId: '' };

   
    if (!/^[a-zA-Z0-9\s]*$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters, numbers, and spaces';
      isValid = false;
    } else if (formData.name.trim().length > 30) {
      newErrors.name = 'Name must not exceed 30 characters';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
      isValid = false;
    }
    else if(formData.name===""){
      newErrors.name='Name Cannot be Empty'
    }
    
    if (formData.parentAssetId && !/^[0-9]+$/.test(formData.parentAssetId)) {
      newErrors.parentAssetId =
        'Parent Asset ID must be a non-negative integer or empty';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {   
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        parentAssetId: formData.parentAssetId
          ? Number(formData.parentAssetId)
          : null,
      };

      // await axios.post('https://localhost:7285/api/asset/Add', payload ,{
      //   headers:{
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   },
      //   withCredentials:true
      // });
       
      const response= await api.post("/Asset/Add",payload);
      console.log(response.data);
      toast.success('Asset added successfully!');

      if (onSuccess) {
        onSuccess();
      }

      setFormData({ name: '', parentAssetId: '' });
      setErrors({ name: '', parentAssetId: '' });
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(error.response?.data?.message || 'Failed to add asset');
    } finally {
      setIsSubmitting(false);
    }
  };




  const clearForm = () => {
    setFormData({ name: '', parentAssetId: '' });
    setErrors({ name: '', parentAssetId: '' });
  };

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
     
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Plus className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add New Asset</h3>
            <p className="text-sm text-gray-600">Create a new node in your hierarchy</p>
          </div>
        </div>
        <button
          onClick={clearForm}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
   
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Asset Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={30}
              required
              placeholder="Enter asset name..."
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400'
              }`}
            />
            {errors.name && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          
       
          <div className="flex justify-between items-center">
            {errors.name ? (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {formData.name.length}/30 characters
              </p>
            )}
          </div>
        </div>

        
        <div className="space-y-2">
          <label htmlFor="parentAssetId" className="block text-sm font-medium text-gray-700">
            Parent Asset ID
          </label>
          <div className="relative">
            <input
              type="text"
              name="parentAssetId"
              id="parentAssetId"
              value={formData.parentAssetId}
              onChange={handleChange}
              placeholder="Leave empty for root asset..."
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.parentAssetId
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400'
              }`}
            />
            {errors.parentAssetId && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          
          {errors.parentAssetId ? (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.parentAssetId}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Optional: Enter parent asset ID to create a child node
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-emerald-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              isSubmitting
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Adding Asset...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Add Asset</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
        <p className="text-sm text-emerald-700">
          <strong>Tip:</strong> Leave Parent Asset ID empty to create a root-level asset, or enter an existing asset ID to create a child node.
        </p>
      </div>
    </div>
  );
};

export default AddForm;