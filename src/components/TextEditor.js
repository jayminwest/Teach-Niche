// src/components/TextEditor.js
import React, { useMemo } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

/**
 * TextEditor Component
 *
 * Provides a rich text editor using SimpleMDE for creating and editing content.
 * Includes custom toolbar configuration and autosave functionality.
 *
 * @param {Object} props
 * @param {string} props.value - The current content of the editor.
 * @param {Function} props.onChange - Function to handle content changes.
 * @param {string} [props.placeholder] - Placeholder text for the editor.
 * @returns {JSX.Element} The text editor component.
 */
const TextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const options = useMemo(() => ({
    autofocus: false,
    spellChecker: true,
    placeholder,
    status: ["lines", "words", "cursor"],
    autosave: {
      enabled: true,
      delay: 1000,
      uniqueId: "editor-autosave",
    },
    toolbar: [
      "bold",
      "italic",
      "heading",
      "|",
      "quote",
      "unordered-list",
      "ordered-list",
      "|",
      "link",
      "image",
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
      "|",
      "guide",
    ],
    previewClass: ["editor-preview", "prose", "max-w-none"],
    uploadImage: false, // Disable direct image uploads for security
    promptURLs: true, // Prompt for URLs when adding links
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true,
    },
  }), [placeholder]);

  return (
    <div className="prose max-w-none">
      <SimpleMDE
        key="simplemde-editor"
        value={value}
        onChange={onChange}
        options={options}
        className="min-h-[300px]"
      />
    </div>
  );
};

export default TextEditor;
