import { Metadata } from "next"
import DrawingTransformer from "@/components/drawing-transformer"

export const metadata: Metadata = {
  title: "Child Drawing Transformer",
  description: "Transform your child's drawings into magical artwork",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-purple-950/30 px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Child Drawing Transformer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your child&apos;s drawings into magical digital artwork using AI
          </p>
        </div>
        
        <DrawingTransformer />

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Create magical memories from your child&apos;s imagination</p>
        </footer>
      </div>
    </main>
  )
}