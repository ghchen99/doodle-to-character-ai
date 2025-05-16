import { Metadata } from "next"
import DrawingTransformer from "@/components/drawing-transformer"

export const metadata: Metadata = {
  title: "Child Drawing Transformer",
  description: "Transform your child's drawings into magical artwork",
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
          Child Drawing Transformer
        </h1>
        <p className="text-lg text-muted-foreground">
          Transform your child&apos;s drawings into magical digital artwork
        </p>
      </div>
      
      <DrawingTransformer />
    </main>
  )
}