"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Stage, Layer, Line } from "react-konva"

interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
}

const DrawingCanvasClient: React.FC<DrawingCanvasProps> = ({ onCapture }) => {
  const stageRef = useRef<any>(null)
  const [lines, setLines] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".canvas-container")
      if (container) {
        const width = Math.min(container.clientWidth, 600)
        const height = width // Keep it square
        setCanvasSize({ width, height })
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])
  
  const handleMouseDown = (e: any) => {
    setIsDrawing(true)
    const pos = e.target.getStage().getPointerPosition()
    setLines([...lines, { points: [pos.x, pos.y] }])
  }
  
  const handleMouseMove = (e: any) => {
    if (!isDrawing) return
    
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    
    const lastLine = lines[lines.length - 1]
    
    if (lastLine) {
      // Add point to the last line
      lastLine.points = lastLine.points.concat([point.x, point.y])
      
      // Update lines state
      setLines([...lines.slice(0, -1), lastLine])
    }
  }
  
  const handleMouseUp = () => {
    setIsDrawing(false)
  }
  
  const handleTouchStart = (e: any) => {
    // Prevent scrolling while drawing
    e.evt.preventDefault()
    handleMouseDown(e)
  }
  
  const handleTouchMove = (e: any) => {
    // Prevent scrolling while drawing
    e.evt.preventDefault()
    handleMouseMove(e)
  }
  
  const handleTouchEnd = () => {
    handleMouseUp()
  }
  
  const handleClear = () => {
    setLines([])
  }
  
  const handleCapture = () => {
    if (lines.length === 0) {
      alert("Please draw something first!")
      return
    }
    
    const stage = stageRef.current
    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    onCapture(dataURL)
  }
  
  return (
    <div className="space-y-4">
      <div className="canvas-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="border rounded-md bg-white"
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke="#000000"
                strokeWidth={5}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
        </Stage>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={handleClear} 
          variant="outline"
          className="w-32"
        >
          Clear
        </Button>
        <Button 
          onClick={handleCapture}
          className="w-32 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
        >
          Transform
        </Button>
      </div>
    </div>
  )
}

export default DrawingCanvasClient