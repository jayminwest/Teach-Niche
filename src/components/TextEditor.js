// src/components/TextEditor.js
import React, { useMemo } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

/**
 * TextEditor Component
 *
 * Provides a rich text editor using ReactQuill for creating and editing content.
 *
 * @param {Object} props
 * @param {string} props.value - The current content of the editor.
 * @param {Function} props.onChange - Function to handle content changes.
 * @returns {JSX.Element} The text editor component.
 */
const TextEditor = ({ value, onChange }) => {
  const options = useMemo(() => ({
    autofocus: false,
    spellChecker: false,
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
    ],
  }), []);

  return (
    <SimpleMDE
      key="simplemde-editor"
      value={value}
      onChange={onChange}
      options={options}
    />
  );
};

export default TextEditor;
