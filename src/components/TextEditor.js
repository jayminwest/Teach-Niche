// src/components/TextEditor.js
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
  // Configuration for the toolbar options
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  // Allowed formats for the editor
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder="Write your tutorial content here..."
    />
  );
};

export default TextEditor;
