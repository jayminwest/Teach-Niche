"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type GuideStep = {
  title: string
  description: string
  image: string
  tips: string[]
}

const guideSteps: GuideStep[] = [
  {
    title: "Choose Your Lesson Topic",
    description: "Focus on one specific trick or concept. Think about what beginners or intermediate players struggle with most.",
    image: "/placeholder.svg?text=Choose+Topic&width=480&height=270",
    tips: [
      "Beginner fundamentals like Lighthouse, Lunar, Airplane, or J-Stick",
      "Common sticking points like getting consistent Lunars or smooth Juggles",
      "Your unique style or a signature move that sets you apart",
      "Break down complex combos into smaller, digestible lessons"
    ]
  },
  {
    title: "Plan Your Lesson Structure",
    description: "A little planning goes a long way! Outline the key steps, identify common mistakes, and think about practice drills.",
    image: "/placeholder.svg?text=Plan+Lesson&width=480&height=270",
    tips: [
      "Write down the 3-5 main steps to land the trick",
      "Identify what usually goes wrong for learners",
      "Plan simple exercises to help build necessary skills",
      "Keep it concise and focused on one skill"
    ]
  },
  {
    title: "Film Your Content",
    description: "You don't need professional equipment! Your smartphone is perfect, just focus on good lighting, clear audio, and stable shots.",
    image: "/placeholder.svg?text=Film+Content&width=480&height=270",
    tips: [
      "Film in a bright area with the kendama clearly visible",
      "Record in a quiet place and speak clearly",
      "Use a simple tripod or prop your phone up for stability",
      "Aim for lessons that are 2-10 minutes long"
    ]
  },
  {
    title: "Create Engaging Content",
    description: "Follow best practices to make your lesson clear and helpful for students of all levels.",
    image: "/placeholder.svg?text=Create+Content&width=480&height=270",
    tips: [
      "Show the full trick at normal speed first, then break it down",
      "Use slow-motion for tricky parts (most phones have this feature)",
      "Highlight common mistakes and how to fix them",
      "Be encouraging - learning kendama is hard!"
    ]
  },
  {
    title: "Set Up Stripe Connect",
    description: "Before creating paid lessons, you'll need to set up Stripe Connect to receive payments directly to your bank account.",
    image: "/placeholder.svg?text=Stripe+Setup&width=480&height=270",
    tips: [
      "Go to Dashboard > Stripe Connect to begin the setup process",
      "Have your banking information ready for direct deposits",
      "Complete all verification steps required by Stripe",
      "You keep 85% of each sale, Teach Niche takes 15% to cover costs"
    ]
  },
  {
    title: "Price Your Lesson",
    description: "Most individual trick lessons sell well in the $3-$10 range. Consider the length, complexity, and demand for the trick.",
    image: "/placeholder.svg?text=Price+Lesson&width=480&height=270",
    tips: [
      "A detailed breakdown of a complex trick might be worth more",
      "Consider what you would pay for similar content",
      "You can offer free lessons to build your audience",
      "Remember: you keep 85% of the sale price"
    ]
  },
  {
    title: "Upload & Publish",
    description: "Use our simple upload form to publish your lesson. Add a compelling thumbnail to attract students.",
    image: "/placeholder.svg?text=Upload+Publish&width=480&height=270",
    tips: [
      "Fill in all details (title, description, price) completely",
      "Upload your video file (supports MP4, MOV, AVI, WEBM)",
      "Add a thumbnail showing the trick clearly",
      "Check everything before hitting publish"
    ]
  },
  {
    title: "Share & Promote",
    description: "Share your lesson on social media and with your community to attract students and build your reputation.",
    image: "/placeholder.svg?text=Share+Promote&width=480&height=270",
    tips: [
      "Share on Instagram, TikTok, and kendama forums",
      "Create short previews to generate interest",
      "Engage with comments and questions from students",
      "Consider offering special promotions for early students"
    ]
  }
]

export function LessonCreationGuide({ 
  variant = "button", 
  className = "" 
}: { 
  variant?: "button" | "card",
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState("1")
  
  const goToNextStep = () => {
    const currentIndex = parseInt(activeStep, 10)
    if (currentIndex < guideSteps.length) {
      setActiveStep((currentIndex + 1).toString())
    }
  }
  
  const goToPrevStep = () => {
    const currentIndex = parseInt(activeStep, 10)
    if (currentIndex > 1) {
      setActiveStep((currentIndex - 1).toString())
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === "button" ? (
        <DialogTrigger asChild>
          <Button className={className}>How to Create Lessons</Button>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold">Learn how to create lessons</h3>
                    <p className="text-sm text-muted-foreground">
                      Our step-by-step guide will help you create amazing kendama lessons
                    </p>
                    <div className="flex items-center text-xs text-primary mt-2">
                      <span>Open guide</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M7 7l10 10M17 7v10H7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl p-4 sm:p-6">
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={() => setOpen(false)}
            className="rounded-full h-6 w-6 inline-flex items-center justify-center bg-background/80 border shadow hover:bg-muted"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <DialogHeader className="mb-4 pr-6">
          <DialogTitle className="text-xl sm:text-2xl">How to Create Great Lessons</DialogTitle>
          <DialogDescription className="text-sm">
            Follow this guide to create high-quality kendama lessons that students will love
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto justify-start">
            {guideSteps.map((_, index) => (
              <TabsTrigger key={index} value={(index + 1).toString()} className="mb-1">
                Step {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {guideSteps.map((step, index) => (
            <TabsContent key={index} value={(index + 1).toString()} className="pt-2">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                  </div>
                  
                  <div className="mx-auto max-w-xs mb-6">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                      <Image 
                        src={step.image} 
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Pro Tips:</h4>
                    <ul className="space-y-3 pl-1">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 items-center">
                          <span className="text-primary text-lg leading-none">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {index === guideSteps.length - 1 && (
                    <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-medium mb-2">Ready to create your first lesson?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        If you want to charge for your lessons, you'll need to set up Stripe Connect first.
                      </p>
                      <div className="flex gap-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/stripe-connect">Set Up Stripe First</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href="/dashboard/upload">Create Free Lesson</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={goToPrevStep}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  {index < guideSteps.length - 1 && (
                    <Button 
                      onClick={goToNextStep}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {index === guideSteps.length - 1 && (
                  <div className="w-full flex justify-end">
                    <Button size="sm" asChild>
                      <Link href="/dashboard/upload">Get Started →</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}