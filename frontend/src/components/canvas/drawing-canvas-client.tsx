"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Stage, Layer, Line } from "react-konva"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../ui/hover-card"

interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
}

const BRUSH_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#E63946" },
  { label: "Blue", value: "#1D3557" },
  { label: "Green", value: "#2A9D8F" },
  { label: "Purple", value: "#7209B7" },
  { label: "Orange", value: "#F4A261" },
  { label: "Pink", value: "#FF6B6B" },
  { label: "Teal", value: "#4ECDC4" },
]

const BRUSH_SIZES = [
  { label: "Small", value: 3 },
  { label: "Medium", value: 5 },
  { label: "Large", value: 8 },
  { label: "Extra Large", value: 12 },
]

const DrawingCanvasClient: React.FC<DrawingCanvasProps> = ({ onCapture }) => {
  const stageRef = useRef<any>(null)
  const [lines, setLines] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0].value)
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value)
  
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
    setLines([...lines, { points: [pos.x, pos.y], color: brushColor, strokeWidth: brushSize }])
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

  const getColorClassName = (color: string) => {
    switch(color) {
      case "#000000": return "bg-black";
      case "#E63946": return "bg-red-500";
      case "#1D3557": return "bg-blue-800";
      case "#2A9D8F": return "bg-emerald-600";
      case "#7209B7": return "bg-purple-700";
      case "#F4A261": return "bg-orange-400";
      case "#FF6B6B": return "bg-pink-500";
      case "#4ECDC4": return "bg-teal-400";
      default: return "bg-black";
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm">Brush Color</div>
                <Select 
                  value={brushColor} 
                  onValueChange={setBrushColor}
                >
                  <SelectTrigger className="w-32">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getColorClassName(brushColor)}`}></div>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {BRUSH_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${getColorClassName(color.value)}`}></div>
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p className="text-sm">Select a color for your brush</p>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm">Brush Size</div>
                <Select 
                  value={brushSize.toString()} 
                  onValueChange={(value) => setBrushSize(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRUSH_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value.toString()}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p className="text-sm">Choose the thickness of your brush</p>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleClear}
          size="sm"
          className="text-sm"
        >
          Clear Canvas
        </Button>
      </div>

      <div className="canvas-container drop-shadow-lg" style={{ maxWidth: "600px", margin: "0 auto" }}>
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
          className="border rounded-xl bg-white"
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
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
          className="w-32 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Transform
        </Button>
      </div>
    </div>
  )
}

export default DrawingCanvasClient