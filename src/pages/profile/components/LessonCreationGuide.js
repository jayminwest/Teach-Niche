import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * LessonCreationGuide Component
 *
 * Renders a guide for instructors on how to create a lesson.
 *
 * @returns {JSX.Element} The Lesson Creation Guide component.
 */
const LessonCreationGuide = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const handleCreateLesson = () => {
    navigate("/create-lesson");
  };

  const steps = [
    {
      title: "1. Text Tutorial",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-2">Guidelines:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Comprehensive:</strong> Should stand alone as a high-quality guide.</li>
            <li><strong>Structure:</strong> Include title, introduction, ideal setup, step-by-step instructions, tips, common mistakes and a conclusion.</li>
            <li><strong>Formatting:</strong> Use headings, bullet points, and emphasis for clarity.</li>
            <li><strong>NOTE:</strong> Teach Niche does not save drafts and so it is recommended you write your lesson elsewhere first and then paste and format it here.</li>
          </ul>
        </>
      ),
    },
    {
      title: "2. Video Tutorial",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-2">Guidelines:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Length & Pricing:</strong> Aim for concise videos. General price guideline is $1 per 2 minutes of content (i.e. $5 for a 10 minute video). Remember you can set your own price!</li>
            <li><strong>Recording:</strong> Film indoors with a clean background. <b>Use portrait orientation.</b></li>
            <li><strong>Quality:</strong> Ensure good lighting and clear audio. Wear clothing that contrasts with your setup.</li>
            <li><strong>Structure:</strong> Include an introduction, demonstration, step-by-step breakdown, tips, and conclusion. Tell them what you'll teach them, teach them, tell them what you taught them. You should be using your text tutorial for structure.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Thumbnail Image",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-2">Requirements:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Resolution:</strong> Minimum 800x1200 pixels (portrait).</li>
            <li><strong>Content:</strong> Visually represent the trick or topic.</li>
            <li><strong>Quality:</strong> Sharp, well-lit, and free of pixelation.</li>
            <li><strong>Simplicity:</strong> Avoid cluttered backgrounds.</li>
            <li><strong>No Text Overlays:</strong> Platform branding will be applied as needed.</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Pricing",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-2">Guidelines:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Standard Guideline:</strong> $1 per 2 minutes of video content.</li>
            <li><strong>Value-Based:</strong> Is this a popular trick? Are people going to want to learn this specific trick from you?</li>
            <li><strong>Accessibility:</strong> Balance fair pricing with audience reach. Remember, you're the one making money from this so set the price where you think it will sell.</li>
            <li><strong>NOTE:</strong> Teach Niche takes money to operate and as such the platform fee per lesson sold is 15%. This is subject to change at any point.</li>
          </ul>
        </>
      ),
    },
    {
      title: "5. Final Checklist",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-2">Before Submitting:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Video follows all guidelines and is ready for upload.</li>
            <li>Text tutorial is comprehensive and well-formatted.</li>
            <li>Thumbnail image meets all requirements.</li>
            <li>Pricing is set appropriately.</li>
            <li>All content has been reviewed for quality and accuracy.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Creating a Lesson on Teach Niche</h2>
      <p className="mb-6">Follow this guide to create high-quality lessons for our community.</p>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="collapse collapse-arrow bg-base-200">
            <input 
              type="radio" 
              name="lesson-guide-accordion"
              checked={activeStep === index} 
              onChange={() => setActiveStep(index)}
            />
            <div className="collapse-title text-xl font-medium">
              {step.title}
            </div>
            <div className="collapse-content">
              {step.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button 
          className="btn btn-primary"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </button>
        {activeStep < steps.length - 1 ? (
          <button 
            className="btn btn-primary"
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          >
            Next
          </button>
        ) : (
          <button 
            className="btn btn-success"
            onClick={handleCreateLesson}
          >
            Create Lesson
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonCreationGuide;
