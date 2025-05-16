"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import DrawingCanvas from "@/components/canvas/drawing-canvas"
import ImageUploader from "@/components/canvas/image-uploader"
import TransformationResult from "@/components/canvas/transformation-result"
import { transformDrawing } from "@/lib/api"

type DrawingData = {
  imageData: string | null;
  description: string | null;
  transformedImageUrl: string | null;
};

export default function DrawingTransformer() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'draw' | 'describe' | 'transform'>('draw')
  const [drawingData, setDrawingData] = useState<DrawingData>({
    imageData: null,
    description: null,
    transformedImageUrl: null,
  })
  
  const handleImageCapture = async (imageData: string) => {
    setIsLoading(true)
    setCurrentStep('describe')
    
    try {
      const description = await transformDrawing.analyzeDrawing(imageData)
      
      setDrawingData({
        imageData,
        description,
        transformedImageUrl: null,
      })
      
      // Automatically start transformation
      const transformedImageUrl = await transformDrawing.generateArtwork(description)
      
      setDrawingData(prev => ({
        ...prev,
        transformedImageUrl,
      }))
      
      setCurrentStep('transform')
    } catch (error) {
      console.error("Error processing drawing:", error)
      alert("Something went wrong while processing your drawing. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleReset = () => {
    setDrawingData({
      imageData: null,
      description: null,
      transformedImageUrl: null,
    })
    setCurrentStep('draw')
  }
  
  return (
    <div className="space-y-8">
      {currentStep === 'draw' ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Drawing</CardTitle>
            <CardDescription>
              Draw something amazing or upload an existing drawing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="draw" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="draw">Draw</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="draw" className="mt-0">
                <DrawingCanvas onCapture={handleImageCapture} />
              </TabsContent>
              <TabsContent value="upload" className="mt-0">
                <ImageUploader onImageSelected={handleImageCapture} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <TransformationResult 
          drawingData={drawingData}
          isLoading={isLoading}
          currentStep={currentStep}
          onReset={handleReset}
        />
      )}
    </div>
  )
}