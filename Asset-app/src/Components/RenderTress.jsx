import React from "react";
import TreeNode from "./TreeNode"

const RenderTress = ({
  treeData,
  onSuccess,
  searchTerm, // Fixed: consistent naming
  setShowOverlay,
  setSelectedNode,
  setOverlayMode,
  userRole,
  token
}) => {
  return (
    <>
      {treeData && treeData.length > 0 && (
        <ul className="tree-view">
          {treeData.map((node) => (
            <TreeNode 
              key={node.id}
              node={node}
              onSuccess={onSuccess}
              searchTerm={searchTerm} // Fixed: consistent naming
              setShowOverlay={setShowOverlay}
              setSelectedNode={setSelectedNode}
              setOverlayMode={setOverlayMode}
              userRole={userRole}
              token={token}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export default RenderTress;