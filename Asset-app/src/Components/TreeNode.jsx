import React, { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { ChevronRight, ExpandMore, Mode } from "@mui/icons-material";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { Signal } from "lucide-react";

const TreeNode = ({ 
  node, 
  searchTerm, // Fixed: consistent naming
  onSuccess, 
  isRoot = false,
  setShowOverlay,
  setSelectedNode,
  setOverlayMode,
  userRole,
  token 
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [Sgnals,setSignals]=useState();
  const navigate = useNavigate();

  // Fixed: Better search matching logic
  const hasMatch = searchTerm && searchTerm.trim() 
    ? (node.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    : false;

  // Fixed: Recursive function to check if any child matches
  const hasChildMatch = (children, term) => {
    if (!children || !term) return false;
    
    return children.some(child => {
      const childMatches = (child.name?.toLowerCase() || "").includes(term.toLowerCase());
      const grandChildMatches = child.children ? hasChildMatch(child.children, term) : false;
      return childMatches || grandChildMatches;
    });
  };

  const childMatch = hasChildMatch(node.children, searchTerm);

  // Fixed: Better expansion logic
  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
      if (hasMatch || childMatch) {
        setExpanded(true);
      }
    } else {
      setExpanded(false);
    }
  }, [searchTerm, hasMatch, childMatch]);

  const nodename = node.name || "";

  // Fixed: Better text highlighting
  const renderHighlightedText = () => {
    if (!searchTerm || !searchTerm.trim()) {
      return <span>{nodename}</span>;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = nodename.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            return (
              <span key={index} className="bg-yellow-300 font-bold px-1 rounded">
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  const copyID = () => {
    navigator.clipboard.writeText(node.id);
    toast.success("Copied ID: " + node.id);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`https://localhost:7169/api/Asset/${node.id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Delete failed: ${res.status} - ${errorText}`);
      }

      toast.success(`Deleted node: ${node.name}`);
      setOpenDialog(false);

      if (onSuccess) await onSuccess();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete node");
    }
  };

  const { show } = useContextMenu({ id: `menu_${node.id}` });

  const handleRightClick = (e) => {
    if (!e) return;
    e.preventDefault();
    e.stopPropagation();
    show({
      event: e,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleAddSignal = () => {
    // setShowOverlay(true);
    // setOverlayMode("add");
    // setSelectedNode(node);
    const event=new CustomEvent("Open-Signal-Overlay",{
      detail:{ asseid : node.id ,Mode:"Add"}

    });

    console.log("Event being dispatched:", event); 
    window.dispatchEvent(event);
  };

  const handleDisplaySignals = () => {
    // try{
    //   const response=await fetch(`https://localhost:7169/api/Signal/${node.id}`);
    //   if(response.ok){
    //     const data=response.json();
    //     setSignals(data);
    //   }else{
    //     console.log("unabel to fetch the signal");
    //   }
    // }catch(error){
    //   console.log(error.message);
    // }
    navigate("/display-signals", { state: node });
  };

  const handleDragStart = (e, nodeId) => {
    e.dataTransfer.setData("assetId", nodeId);
    const dragIcon = document.createElement("div");
    dragIcon.style.width = "100px";
    dragIcon.style.height = "20px";
    dragIcon.style.background = "lightblue";
    dragIcon.style.display = "flex";
    dragIcon.style.justifyContent = "center";
    dragIcon.style.alignItems = "center";
    dragIcon.innerText = "Dragging...";
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 50, 10);
    setTimeout(() => document.body.removeChild(dragIcon), 0);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, nodeId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("assetId");
    const parentId = nodeId;

    if (!draggedId || !parentId) return;

    try {
      const response = await fetch("https://localhost:7169/api/Asset/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          childId: parseInt(draggedId),
          newParentId: parseInt(parentId),
        }),
      });
         toast.success("node Tranfer Sucessfully");
      if (!response.ok) {
        throw new Error("Failed to transfer asset");
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      console.error("Error transferring asset:", error);
    }
  };

  return (
    <li className={`ml-4 mb-2`}>
      <div
        className={`flex items-center justify-between py-2 px-4 rounded-lg cursor-pointer transition-colors ${
          isRoot ? "bg-blue-50 w-full hover:bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
        } ${hasMatch ? "ring-2 ring-yellow-300" : ""}`}
        onClick={() => setExpanded(!expanded)}
        onContextMenu={handleRightClick}
        draggable={true}
        onDragOver={allowDrop}
        onDragStart={(e) => handleDragStart(e, node.id)}
        onDrop={(e) => handleDrop(e, node.id)}
      >
        <div className="flex items-center space-x-2">
          {node.children && node.children.length > 0 && (
            expanded ? 
              <ExpandMore className="w-5 h-5 text-gray-500" /> : 
              <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          {renderHighlightedText()}
        </div>

        <div className="flex items-center space-x-2">
          {userRole === "Admin" && (
            <div className="flex items-center gap-2">
              <ContentCopyIcon
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  copyID();
                }}
                title="Copy ID"
              />
              <DeleteIcon
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDialog(true);
                }}
                title="Delete"
              />
            </div>
          )}
        </div>
      </div>

      <Menu id={`menu_${node.id}`}>
        {userRole === "Admin" && <Item onClick={handleAddSignal}>Add Signal</Item>}
        <Item onClick={handleDisplaySignals}>Display Signals</Item>
      </Menu>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "<strong>{node.name}</strong>"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {expanded && node.children && node.children.length > 0 && (
        <ul className={`ml-6 border-l-2 border-gray-200 pl-4`}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              searchTerm={searchTerm} // Fixed: consistent naming
              onSuccess={onSuccess}
              isRoot={false}
              setSelectedNode={setSelectedNode}
              setShowOverlay={setShowOverlay}
              setOverlayMode={setOverlayMode}
              userRole={userRole}
              token={token}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;