"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null)
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
  
  return (
    <div className="space-y-4">
      <div 
        className="canvas-container flex flex-col items-center justify-center p-6"
        style={{ 
          maxWidth: "600px", 
          height: "600px",
          margin: "0 auto"
        }}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Uploaded drawing" 
            className="max-w-full max-h-full object-contain rounded-md"
          />
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="mx-auto h-12 w-12 text-muted-foreground"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Upload drawing</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop or click to upload
            </p>
            <Button 
              variant="outline" 
              onClick={handleUploadClick}
              className="mt-4"
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
          className="w-32 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          disabled={!preview}
        >
          Transform
        </Button>
      </div>
    </div>
  )
}

export default ImageUploader