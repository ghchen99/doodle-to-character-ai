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
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
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
      <h3 className="text-lg font-medium mb-2">
        {currentStep === 'describe' ? 'Analyzing your drawing...' : 'Creating magical artwork...'}
      </h3>
      <p className="text-muted-foreground mb-4">This may take a moment</p>
      <Progress 
        value={currentStep === 'describe' ? 50 : 75} 
        className="max-w-md mx-auto h-2 bg-gradient-to-r from-purple-100 to-blue-100"
      />
    </div>
  )
  
  return (
    <div className="space-y-8">
      {/* Description - Show this first while waiting for transformed image */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30">
        <CardHeader className="bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardTitle className="flex items-center gap-2">
            AI's Interpretation
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
        <CardContent className="pt-6">
          {isLoading && currentStep === 'describe' ? (
            renderLoadingState()
          ) : (
            <p className="text-muted-foreground leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow-inner">
              {drawingData.description || "No description available"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Drawing */}
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardTitle>Original Drawing</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-0 overflow-hidden bg-white dark:bg-gray-800" style={{ height: '300px' }}>
            {drawingData.imageData && (
              <img 
                src={drawingData.imageData} 
                alt="Original drawing" 
                className="max-w-full max-h-full object-contain rounded-md"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Transformed Drawing */}
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardTitle>Transformed Drawing</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-0 overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30" style={{ height: '300px' }}>
            {drawingData.transformedImageUrl ? (
              <img 
                src={drawingData.transformedImageUrl}
                alt="Transformed drawing" 
                className="max-w-full max-h-full object-contain rounded-md"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                {renderLoadingState()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onReset} 
          className="px-8 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Create New Drawing
        </Button>
      </div>
    </div>
  )
}

export default TransformationResult