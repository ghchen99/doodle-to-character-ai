"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

interface TransformationResultProps {
  drawingData: {
    imageData: string | null;
    description: string | null;
    transformedImageUrl: string | null;
  };
  isLoading: boolean;
  currentStep: 'draw' | 'describe' | 'transform';
  onReset: () => void;
}

const TransformationResult: React.FC<TransformationResultProps> = ({
  drawingData,
  isLoading,
  currentStep,
  onReset
}) => {
  
  const renderLoadingState = () => (
    <div className="py-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
        <svg
          className="w-8 h-8 text-purple-600 animate-spin"
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
      </div>
      <h3 className="text-lg font-medium mb-2">Transformation in progress...</h3>
      <p className="text-muted-foreground mb-4">This may take a moment</p>
      <Progress 
        value={currentStep === 'describe' ? 50 : 75} 
        className="max-w-md mx-auto"
      />
    </div>
  )
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          {renderLoadingState()}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Drawing */}
        <Card>
          <CardHeader>
            <CardTitle>Original Drawing</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-0 overflow-hidden" style={{ height: '300px' }}>
            {drawingData.imageData && (
              <img 
                src={drawingData.imageData} 
                alt="Original drawing" 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Transformed Drawing */}
        <Card>
          <CardHeader>
            <CardTitle>Transformed Drawing</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-0 overflow-hidden" style={{ height: '300px' }}>
            {drawingData.transformedImageUrl ? (
              <img 
                src={drawingData.transformedImageUrl}
                alt="Transformed drawing" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted">
                {renderLoadingState()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Description
            <HoverCard>
              <HoverCardTrigger asChild>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-4 w-4 text-muted-foreground cursor-help"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">
                  This is how our AI interpreted your drawing before transforming it.
                </p>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {drawingData.description || "No description available"}
          </p>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end pt-4 pb-4">
          <Button onClick={onReset} className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            Create New Drawing
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default TransformationResult