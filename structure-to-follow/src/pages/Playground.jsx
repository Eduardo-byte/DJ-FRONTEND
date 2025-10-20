import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import PlaygroundComponent from "../components/playground";

export default function Playground() {
  const { agentId } = useParams();
  
  // Force sidebar to collapse when Playground component mounts
  useEffect(() => {
    // Create and dispatch a custom event to collapse the sidebar
    const collapseSidebarEvent = new CustomEvent('collapse-sidebar');
    window.dispatchEvent(collapseSidebarEvent);
  }, []);
  
  return <PlaygroundComponent agentId={agentId} />;
}
