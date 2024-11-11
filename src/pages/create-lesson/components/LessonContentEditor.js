import React from 'react';
import TextEditor from '../../../components/TextEditor';

const LessonContentEditor = ({ content, onChange }) => {
  return (
    <div className="border-t border-gray-900/10 pt-8">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Lesson Content</h3>
        <div className="relative group">
          <div className="cursor-help text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <p className="mb-2">TeachNiche doesn't auto-save content. We recommend:</p>
            <ul className="list-disc ml-4">
              <li>Writing your content in a separate document first</li>
              <li>Using Markdown formatting for better presentation</li>
              <li>Copying and pasting your final text here</li>
            </ul>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>
      <div className="mt-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Supports Markdown</span>
          <a 
            href="https://www.markdownguide.org/basic-syntax/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
          >
            View formatting guide
          </a>
        </div>
      </div>
      <div className="mt-4">
        <TextEditor
          value={content}
          onChange={onChange}
          options={{
            hideIcons: ['side-by-side', 'fullscreen'],
            status: false,
            spellChecker: true,
            minHeight: "200px",
            maxHeight: "400px"
          }}
        />
      </div>
    </div>
  );
};

export default LessonContentEditor; 