import React, { useState, useEffect } from "react";
import { Upload, Plus, Download, Search, BarChart3, FolderTree, Activity, Info, MousePointer, Eye, Settings } from "lucide-react";
import AddForm from "./AddForm";
import RenderTress from './RenderTress';
import Search2 from "./Search2";
// import SignalOverlay from "./SignalOverlay";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { useSelector, useDispatch } from "react-redux";
// import { setUser } from "../store/UserSlice";

// File Upload Component
const FileUpload = ({ onFileChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const mockEvent = { target: { files: e.dataTransfer.files } };
      onFileChange(mockEvent);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileChange(e);
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("upload_tree").click()}
      >
        <input
          type="file"
          accept="application/json, text/plain"
          id="upload_tree"
          className="hidden"
          onChange={handleChange}
        />
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${dragActive ? "bg-blue-100" : "bg-gray-100"}`}>
            <Upload className={`w-8 h-8 ${dragActive ? "text-blue-600" : "text-gray-600"}`} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {dragActive ? "Drop your file here" : "Upload Asset Hierarchy"}
            </p>
            <p className="text-gray-500 text-sm">Drag and drop your JSON file here, or click to browse</p>
            <p className="text-gray-400 text-xs mt-1">Supports: JSON, TXT files</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div
    className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// Instructions Card Component
const InstructionsCard = ({ userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-blue-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">How to Use</h3>
              <p className="text-blue-700 text-sm">Click to view instructions</p>
            </div>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                <MousePointer className="w-4 h-4 mr-2 text-blue-600" />
                Right-Click Options
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Right-click on any node in the tree to access these options:
              </p>
            </div>
            
            {userRole === "Admin" ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Settings className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-green-900">Add Signal</h5>
                    <p className="text-sm text-green-700">
                      Right-click on any node → Select "Add Signal" to create new signals for that asset
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-900">Display Signals</h5>
                    <p className="text-sm text-blue-700">
                      Right-click on any node → Select "Display Signals" to view all signals for that asset
                    </p>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm font-medium text-amber-800">Admin Access</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    You have full access to add and manage signals across all nodes
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-900">Display Signals</h5>
                    <p className="text-sm text-blue-700">
                      Right-click on any node → Select "Display Signals" to view all signals for that asset
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800">User Access</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    You can view signals but cannot add or modify them
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              {/* <p className="text-xs text-gray-500 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Tip: Look for the right-click cursor when hovering over nodes
              </p> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Menu1() {
  const [treeData, setTreeData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [stats, setStats] = useState({ totalNodes: 0, maxDepth: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [overlayMode, setOverlayMode] = useState("add");
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [fileErrors, setFileErrors] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigate = useNavigate();


   const loadUserFromLocalStorage = () => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const username = parsedUser.username || "";
        const role = parsedUser.role || null;

        setUserName(username);
        setUserRole(role);
        setIsLoggedIn(true);

        console.log("Loaded from localStorage -> Username:", username, "Role:", role);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        setUserName("");
        setUserRole(null);
        setIsLoggedIn(false);
      }
    } else {
      setUserName("");
      setUserRole(null);
      setIsLoggedIn(false);
    }
  };

  // Sync local state with Redux store
const fetchUserDataAfterGoogleLogin = async () => {
  try {
    console.log("Fetching user data after Google login...");
    
    const response = await fetch("https://localhost:7285/api/User/me", {
      credentials: "include",
    });

    if (response.ok) {
      const user = await response.json();
      const normalizedUser = {
        username: user.username || user.name || "",
        role: user.role || "User",
      };
      
      console.log("Google login - storing user data:", normalizedUser);
      
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUserName(normalizedUser.username);
      setUserRole(normalizedUser.role);
      setIsLoggedIn(true);
      
      toast.success('Google login successful!');
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } else {
      throw new Error("Failed to fetch user data after Google login");
    }
  } catch (err) {
    console.error("Error fetching user after Google login:", err);
    toast.error("Failed to load user data. Please try logging in again.");
    navigate("/Register");
  }
};




useEffect(() => {
  // Check if this is a Google login redirect
  const params = new URLSearchParams(window.location.search);
  if (params.has("googleLogin")) {
    // Handle Google login callback
    fetchUserDataAfterGoogleLogin();
  } else {
    // Normal page load - check localStorage
    loadUserFromLocalStorage();
  }

  window.addEventListener("storage", loadUserFromLocalStorage);
  return () => window.removeEventListener("storage", loadUserFromLocalStorage);
}, []);


  // Fetch hierarchy and statistics on mount
  useEffect(() => {
    fetchHierarchy(); 
    fetchStatistics();
  }, []);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://localhost:7169/api/Asset/heirarchy", {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/Register");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch hierarchy");
      const data = await res.json();
      setTreeData(data);
    } catch (err) {
      console.error("Error fetching hierarchy:", err);
      setTreeData([]);
      toast.error("Failed to fetch hierarchy data");
    } finally {
      setLoading(false);    
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch("https://localhost:7169/api/Asset/statistics", {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/Register");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch statistics");
      const data = await res.json();
      setStats({ totalNodes: data.totalNodes, maxDepth: data.maxDepth });
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setStats({ totalNodes: 0, maxDepth: 0 });
      toast.error("Failed to fetch statistics");
    }
  };

  const onSuccessHandler = async () => {
    await fetchHierarchy();
    await fetchStatistics();
    setRefreshTrigger((prev) => prev + 1);
  };



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try { 
      const res = await fetch("https://localhost:7169/api/Asset/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setFileErrors(data.errors || []);
       
        toast.error(
          <div>
            <p>File upload failed. View details?</p>
            <button
              onClick={() => navigate("/fileError", { state: { errors: data.errors } })}
              className="mt-2 bg-blue-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              View Errors
            </button>
          </div>,
          {
            autoClose: 5000, 
            closeOnClick: false,
            draggable: false,
          }
        );
      } else {
        toast.success(data.message || "File uploaded successfully!");
        onSuccessHandler();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Something went wrong: " + error.message);
    }

    e.target.value = "";
  };

  const handleDownload = () => {
    if (!treeData || treeData.length === 0) {
      toast.error("No data to download");
      return;
    }
    const blob = new Blob([JSON.stringify(treeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "treeData.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterTree = (nodes, keyword) => {
    if (!keyword) return nodes;
    return nodes
      .map((node) => {
        const children = node.children ? filterTree(node.children, keyword) : [];
        if (node.name.toLowerCase().includes(keyword.toLowerCase()) || children.length) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("https://localhost:7169/api/User/logout", {
        method: "POST",
        credentials: "include",
      });
      console.log("Logout response:", res);
      if (!res.ok) throw new Error("Logout failed");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }

    // Reset Redux store user data
   
    // Clear localStorage
    localStorage.clear();
    // Redirect to login page
    navigate("/Register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FolderTree className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Asset Hierarchy</h1>
                <p className="text-gray-600 text-sm">Manage and visualize your asset structure</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              {isLoggedIn ? (
                <div className="flex items-center space-x-4 bg-gray-100 px-4 py-2 rounded-full shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold uppercase">
                    {userName ? userName[0] : "U"}
                  </div>
                  <span className="text-gray-800 font-medium text-lg">{userName}</span>
                  <button
                    onClick={handleLogout}
                    className="ml-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full font-medium transition-all duration-200 shadow hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/Register")}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={BarChart3}
            title="Total Nodes"
            value={stats.totalNodes}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={FolderTree}
            title="Maximum Depth"
            value={stats.maxDepth}
            color="from-emerald-500 to-emerald-600"
          />
        </div>

        {isLoggedIn && (
          <div className="mb-6">
            <InstructionsCard userRole={userRole} />
          </div>
        )}

        <Search2 searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FolderTree className="w-5 h-5 mr-2 text-blue-600" />
                  Hierarchy Visualization
                </h2>
                <p className="text-gray-600 text-sm mt-1">Interactive tree view of your assets</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : treeData.length > 0 ? (
                  <RenderTress
                    key={refreshTrigger}
                    treeData={filterTree(treeData, searchTerm)}
                    onSuccess={onSuccessHandler}
                    searchTerm={searchTerm}
                    setShowOverlay={setShowOverlay}
                    setSelectedNode={setSelectedNode}
                    setOverlayMode={setOverlayMode}
                    userRole={userRole}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hierarchy data available</p>
                    <p className="text-gray-400 text-sm">Upload a file to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                File Management
              </h3>
              {userRole === "Admin" ? <FileUpload onFileChange={handleFileChange} /> : <div></div>}
              <button
                onClick={handleDownload}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download Data</span>
              </button>
            </div>

            {userRole === "Admin" ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Operations</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setOpenAdd(!openAdd)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Node</span>
                  </button>
                </div>
                {openAdd && <AddForm onSuccess={onSuccessHandler} />}
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>

      {/* <SignalOverlay
        show={showOverlay}
        node={selectedNode}
        mode={overlayMode}
        onClose={() => setShowOverlay(false)}
        onSuccess={onSuccessHandler}
      /> */}
    </div>
  );
}

export default Menu1;