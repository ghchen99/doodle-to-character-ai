"use client"

import dynamic from "next/dynamic"

// Placeholder component shown during loading
const LoadingCanvas = () => (
  <div className="canvas-container flex items-center justify-center" style={{ height: "600px" }}>
    <div className="text-center">
      <svg 
        className="animate-spin h-10 w-10 mx-auto mb-4 text-purple-600" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p>Loading drawing canvas...</p>
    </div>
  </div>
)

// Interface for props
interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
}

// Dynamically import the actual canvas component with SSR disabled
const DrawingCanvasClient = dynamic<DrawingCanvasProps>(
  () => import("./drawing-canvas-client"),
  { 
    ssr: false,
    loading: () => <LoadingCanvas />
  }
)

// Export the dynamic component
export default DrawingCanvasClient