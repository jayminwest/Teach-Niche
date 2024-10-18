import React from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

/**
 * LessonCreationGuide Component
 *
 * Renders a guide for instructors on how to create a lesson.
 *
 * @returns {JSX.Element} The Lesson Creation Guide.
 */
export default function LessonCreationGuide() {
  const navigate = useNavigate();

  /**
   * Navigates to the create lesson page.
   */
  const handleCreateLesson = () => {
    navigate("/create-lesson");
  };

  const guidelinesContent = `
# Creating a Lesson on Teach Niche: A Comprehensive Guide for Instructors

Welcome to **Teach Niche**! We're thrilled to have you share your kendama expertise with our community. To ensure that all tutorials maintain a high standard of quality and consistency, we've developed a template and guidelines to assist you in creating your lessons.

## Lesson Components

Each lesson should consist of the following elements:

1. **Video Tutorial**
2. **Text Tutorial**
3. **Thumbnail Image**
4. **Pricing**

### 1. Video Tutorial

**Guidelines:**

- **Length & Pricing:**
  - Aim for a clear and concise video.
  - **Pricing Guideline:** Set your lesson price at **$1 for every 2 minutes of content**. For example, a 6-minute tutorial could be priced at $3.

- **Recording Requirements:**
  - **Setting:** Film indoors with a blank or non-distracting background to keep the focus on your instruction.
  - **Orientation:** Record in **portrait orientation** to ensure consistency across all tutorials on the platform.
  - **Lighting:** Use ample lighting to make sure all movements and details are clearly visible.
  - **Audio Quality:** Ensure clear audio. Use a quality microphone if possible to capture your voice without background noise.
  - **Attire:** Wear clothing that contrasts with your kendama to highlight movements.
  - **Framing:** Position the camera to capture your upper body and the kendama clearly during demonstrations.

- **Content Structure:**
  1. **Introduction:**
     - Briefly introduce yourself.
     - State the name of the trick or topic you will cover.
  2. **Demonstration:**
     - Show the trick at normal speed to provide an overview.
  3. **Step-by-Step Breakdown:**
     - Divide the trick into manageable steps.
     - Explain each step thoroughly.
     - Use close-ups or slow motion where helpful.
  4. **Tips & Common Mistakes:**
     - Share insights on how to master difficult parts.
     - Highlight common errors and how to avoid them.
  5. **Conclusion:**
     - Encourage viewers to practice.
     - Invite them to share their progress or ask questions.

### 2. Text Tutorial

**Guidelines:**

- **Independence:** The text tutorial should be comprehensive enough to stand on its own as a high-quality instructional guide, even without the video.

- **Structure:**

  1. **Title:**
     - Clearly state the name of the trick or topic.
  2. **Introduction:**
     - Provide background information or the significance of the trick.
     - Mention the skill level required (e.g., Beginner, Intermediate, Advanced).
  3. **Materials Needed:**
     - List any specific kendama types or accessories if necessary.
  4. **Step-by-Step Instructions:**
     - Number each step.
     - Use clear and concise language.
     - Include details that might not be obvious in the video.
  5. **Tips & Insights:**
     - Offer additional advice.
     - Suggest variations or ways to increase difficulty.
  6. **Conclusion:**
     - Summarize key points.
     - Encourage further practice and exploration.

- **Formatting:**
  - Use headings and subheadings to organize content.
  - Incorporate bullet points or numbered lists for clarity.
  - Highlight important terms or concepts in **bold** or *italics*.

### 3. Thumbnail Image

**Guidelines:**

- **Image Requirements:**
  - **Resolution:** Minimum of **800x1200 pixels** (portrait orientation).
  - **Content:** Should visually represent the trick or topic.
    - Example: An action shot of the trick, a still of you holding the kendama, etc.
  - **Quality:** Ensure the image is sharp, well-lit, and free of pixelation.
  - **Simplicity:** Avoid cluttered backgrounds or distracting elements.
  - **No Text Overlays:** Do not add text or logos; platform branding will be applied as needed.

### 4. Pricing

**Guidelines:**

- **Standard Pricing Model:**
  - Use the guideline of **$1 per 2 minutes of video content**.
  - Adjust the price according to the depth and uniqueness of your content if necessary.

- **Considerations:**
  - **Value to Learners:** Price your lesson based on the value it provides, not just the length.
  - **Market Rates:** Keep in mind what other instructors are charging for similar content.
  - **Accessibility:** Affordable pricing can attract more learners and build your audience.

- **Offering Discounts or Free Content:**
  - **Promotions:** Occasionally offering discounts can boost engagement.
  - **Free Previews:** Providing a short free segment can entice learners to purchase the full lesson.

### Additional Tips for a Successful Lesson

- **Consistency:** Maintain a consistent teaching style and format to build your personal brand.
- **Clarity:** Speak clearly and at a moderate pace; avoid jargon unless explained.
- **Engagement:** Encourage learners to reach out with questions or share their progress.
- **Feedback:** Be open to constructive feedback to improve future lessons.
- **Professionalism:** Ensure all content reflects well on you and the Teach Niche community.

### Submission Checklist

**Before submitting your lesson, make sure you have:**

- [ ] **Video Tutorial:**
  - Recorded in portrait orientation.
  - Follows all recording guidelines.
  - Edited and ready for upload.
- [ ] **Text Tutorial:**
  - Comprehensive and standalone.
  - Properly formatted with clear instructions.
- [ ] **Thumbnail Image:**
  - High-resolution and relevant.
  - Meets all image guidelines.
- [ ] **Pricing:**
  - Set according to the pricing guidelines.
  - Reflects the value of your content.
- [ ] **Review:**
  - Watched your video for any errors.
  - Proofread your text for spelling and grammar.
  - Confirmed that all elements meet Teach Niche standards.

### How to Submit Your Lesson

1. **Log In:** Access your Teach Niche instructor account.
2. **Navigate to the Submission Page:** Click on "Create a Lesson" or the equivalent section.
3. **Upload Your Content:**
   - **Video:** Upload your video file (supported formats: MP4, MOV).
   - **Text:** Paste your text tutorial into the editor or upload a document (supported formats: DOCX, PDF).
   - **Thumbnail:** Upload your thumbnail image (supported formats: JPEG, PNG).
4. **Set Your Price:** Enter the price for your lesson based on the guidelines.
5. **Preview:** Review your lesson to ensure everything appears correctly.
6. **Submit for Review:** Click the "Submit" button to send your lesson to the Teach Niche team for approval.

### Support and Questions

**If you need assistance at any stage:**

- **Email Us:** [support@teachniche.com](mailto:support@teachniche.com)
- **FAQ:** Visit our [Instructor FAQ](#) page for common questions.
- **Community:** Join our instructor community group on [Platform/Forum] to connect with other creators.

### Thank You for Sharing Your Expertise!

Your contributions help grow and strengthen the kendama community. We're excited to have you on board and can't wait to see the amazing lessons you'll create.

**Teach Niche** – Empowering Kendama Players Worldwide

*Note: Please ensure that all content adheres to Teach Niche's [Content Guidelines](#) and [Terms of Service](#).*
  `;

  return (
    <div className="prose max-w-3xl mx-auto">
      <ReactMarkdown>{guidelinesContent}</ReactMarkdown>
      <div className="text-center mt-8">
        <button
          className="btn btn-primary text-xl px-6 py-3"
          onClick={handleCreateLesson}
        >
          Create Lesson
        </button>
      </div>
    </div>
  );
}
