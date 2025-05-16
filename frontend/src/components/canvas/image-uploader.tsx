"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) return
    
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }
    
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setPreview(imageData)
    }
    
    reader.readAsDataURL(file)
  }
  
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleTransform = () => {
    if (preview) {
      onImageSelected(preview)
    } else {
      alert("Please upload an image first!")
    }
  }
  
  const handleClear = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }
    
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setPreview(imageData)
    }
    
    reader.readAsDataURL(file)
  }
  
  return (
    <div className="space-y-4">
      <div 
        className={`canvas-container flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all duration-300 rounded-xl ${
          isDragging 
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
            : "border-muted bg-white/50 dark:bg-gray-800/50"
        }`}
        style={{ 
          maxWidth: "600px", 
          height: "600px",
          margin: "0 auto"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={preview} 
            alt="Uploaded drawing" 
            className="max-w-full max-h-full object-contain rounded-md shadow-md"
          />
        ) : (
          <div className="text-center">
            <motion.div 
              className="mb-6"
              animate={{ y: isDragging ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className={`mx-auto h-16 w-16 ${
                  isDragging 
                    ? "text-purple-500" 
                    : "text-muted-foreground"
                }`}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                />
              </svg>
            </motion.div>
            <h3 className="text-lg font-medium">Upload drawing</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Drag and drop or click to upload
            </p>
            <Button 
              variant="outline" 
              onClick={handleUploadClick}
              className="mt-4 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 dark:from-purple-900/30 dark:to-blue-900/30 transition-all duration-300"
            >
              Select File
            </Button>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={handleClear} 
          variant="outline"
          className="w-32"
          disabled={!preview}
        >
          Clear
        </Button>
        <Button 
          onClick={handleTransform}
          className="w-32 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
          disabled={!preview}
        >
          Transform
        </Button>
      </div>
    </div>
  )
}

export default ImageUploader