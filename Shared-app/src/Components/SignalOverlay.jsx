import React from "react";
import { toast } from "react-toastify";
import { X, Signal, Database, FileText, Settings, Save, XCircle } from "lucide-react";
import eventBus from  "../utils/eventBus";
import { SIGNAL_EVENTS } from "../Events/signalEvents";

const SignalOverlay = () => {
 const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [node, setNode] = useState(null);
  const [signal, setSignal] = useState(null);
  const [token, setToken] = useState(null);


useEffect(()=>{
    const openhandler=(data)=>{
        setOpen(true);
        setMode(data?.mode || "add");
        setNode(data?.node || null);
        setSignal(data?.signal || null);
    }
    const closeHandler=()=>setOpen(false);

    eventBus.on(SIGNAL_EVENTS.OPEN_SIGNAL_OVERLAY ,openhandler);
    eventBus.on(SIGNAL_EVENTS.CLOSE_SIGNAL_OVERLAY,closeHandler);


    return()=>{
        eventBus.off(SIGNAL_EVENTS.OPEN_SIGNAL_OVERLAY,openhandler);
        eventBus.off(SIGNAL_EVENTS.CLOSE_SIGNAL_OVERLAY,closeHandler);
    }
},[]);

//   if (!show || !node) return null;


  const [formData, setFormData] = React.useState({
    signalName: "",
    valueType: "",
    description: "",
    assetId: node.id,
  });

  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

 
  React.useEffect(() => {
    if (mode === "edit" && signal) {
      setFormData({
        signalName: signal.signalName || "",
        valueType: signal.valueType || "",
        description: signal.description || "",
        assetId: node.id,
      });
    } else {
      setFormData({
        signalName: "",
        valueType: "",
        description: "",
        assetId: node.id,
      });
    }
  }, [mode, signal, node.id]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (formData.signalName === "") {
      newErrors.signalName = 'Signal Name cannot be empty';
      isValid = false;
    } else if (!/^[a-zA-Z\s]*$/.test(formData.signalName)) {
      newErrors.signalName = 'Signal Name can only contain letters and spaces';
      isValid = false;
    } else if (formData.signalName.trim().length < 3) {
      newErrors.signalName = 'Signal Name must be at least 3 characters long';
      isValid = false;
    } else if (formData.signalName.trim().length > 50) {
      newErrors.signalName = 'Signal Name must not exceed 50 characters';
      isValid = false;
    }

    if (formData.valueType === "") {
      newErrors.valueType = 'Value Type cannot be empty';
      isValid = false;
    } else if (!["int", "real"].includes(formData.valueType)) {
      newErrors.valueType = 'Value Type must be exactly "int" or "real"';
      isValid = false;
    }

    if (formData.description === "") {
      newErrors.description = 'Description cannot be empty';
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s.,_-]*$/.test(formData.description)) {
      newErrors.description = 'Description can only contain letters, numbers, spaces, and basic punctuation (. , - _)';
      isValid = false;
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters long';
      isValid = false;
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must not exceed 200 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  
  const parseErrorMessage = (error, response = null) => {
    
    if (response && response.message) {
      return response.message;
    }
    
   
    if (error.response && error.response.message) {
      return error.response.message;
    }
    
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    
    return "An unexpected error occurred. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const url =
        mode === "edit"
          ? `https://localhost:7169/api/Signal/${signal.signalId}`
          : "https://localhost:7169/api/Signal";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials:'include',
        headers:{
           "Content-Type": "application/json",
        },    
        body: JSON.stringify({
          ...formData,
          signalName: formData.signalName.trim(),
          description: formData.description.trim(),
        }),
      });

      // ✅ Handle both success and error responses properly
      if (!response.ok) {
        let errorMessage = "An error occurred";
        
        try {
          // Try to parse JSON error response
          const errorData = await response.json();
          errorMessage = parseErrorMessage(errorData, errorData);
        } catch (jsonError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        
        toast.error(errorMessage);
        return; // Exit early on error
      }

      // ✅ Handle successful response
      const data = await response.json();

      if (mode === "edit") {
        toast.success("Signal updated successfully!");
        if (onUpdate) onUpdate(data);
      } else {
        toast.success("Signal added successfully!");
        if (onUpdate) onUpdate(data);
      }

      onClose();

    } catch (error) {
      console.error("Error submitting form:", error);
      
      // ✅ Handle different types of network/fetch errors
      let errorMessage = "Failed to connect to server. Please check your connection.";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network error: Unable to connect to server";
      } else if (error.name === 'AbortError') {
        errorMessage = "Request was cancelled";
      } else {
        errorMessage = parseErrorMessage(error);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Click outside to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300">


        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Signal Name */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Signal className="h-4 w-4 text-slate-500" />
              Signal Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="signalName"
                value={formData.signalName}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-slate-400 ${
                  errors.signalName 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder="Enter a descriptive signal name"
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                <span className="text-xs">
                  {formData.signalName.length}/50
                </span>
              </div>
            </div>
            {errors.signalName && (
              <p className="text-red-600 text-sm flex items-center gap-2" role="alert">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.signalName}
              </p>
            )}
          </div>

          {/* Value Type */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Database className="h-4 w-4 text-slate-500" />
              Value Type
            </label>
            <div className="relative">
              <select
                name="valueType"
                value={formData.valueType}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm appearance-none cursor-pointer ${
                  errors.valueType 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="" className="text-slate-400">Select data type</option>
                <option value="int">Integer (int)</option>
                <option value="real">Real Number (real)</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {errors.valueType && (
              <p className="text-red-600 text-sm flex items-center gap-2" role="alert">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.valueType}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <FileText className="h-4 w-4 text-slate-500" />
              Description
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-slate-400 resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder="Provide a detailed description of this signal's purpose and functionality"
                disabled={isSubmitting}
                rows="4"
              />
              <div className="absolute right-3 bottom-3 text-slate-400">
                <span className="text-xs">
                  {formData.description.length}/200
                </span>
              </div>
            </div>
            {errors.description && (
              <p className="text-red-600 text-sm flex items-center gap-2" role="alert">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.description}
              </p>
            )}
          </div>

          {/* Asset ID (Read-only) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Settings className="h-4 w-4 text-slate-500" />
              Asset ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={`Asset ID: ${node.id}`}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/80 text-slate-600 cursor-not-allowed"
                disabled
                readOnly
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">
                  Read-only
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 p-8 border-t border-slate-200/50 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold flex items-center gap-2 group"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4 group-hover:text-slate-500 transition-colors" />
            Cancel
          </button>
          
          <button
            type="button"
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed hover:transform-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {mode === "edit" ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "edit" ? "Update Signal" : "Add Signal"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignalOverlay; 