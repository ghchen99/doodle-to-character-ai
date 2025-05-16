"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    setDrawingData({
      imageData,
      description: null, 
      transformedImageUrl: null,
    })
    
    try {
      // Process drawing description
      const description = await transformDrawing.analyzeDrawing(imageData)
      
      // Update with description first
      setDrawingData(prev => ({
        ...prev,
        description,
      }))
      
      // Then start transformation
      setCurrentStep('transform')
      
      // Generate artwork
      const transformedImageUrl = await transformDrawing.generateArtwork(description)
      
      // Update with transformed image
      setDrawingData(prev => ({
        ...prev,
        transformedImageUrl,
      }))
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
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30">
          <CardHeader className="bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardTitle className="text-2xl">Create Your Drawing</CardTitle>
            <CardDescription className="text-muted-foreground">
              Draw something amazing or upload an existing drawing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="draw" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 dark:bg-gray-800/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="draw"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20"
                >
                  Draw
                </TabsTrigger>
                <TabsTrigger 
                  value="upload"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20"
                >
                  Upload
                </TabsTrigger>
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