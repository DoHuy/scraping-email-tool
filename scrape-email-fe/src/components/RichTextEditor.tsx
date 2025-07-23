import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for the Snow theme
import "react-quill/dist/quill.bubble.css"; // Bubble theme
import "react-quill/dist/quill.core.css"; // Core styles for Quill editor

interface RichTextEditorProps {
  handleOnchange: (content: string) => void;
}

const RichTextEditor = forwardRef(
  ({ handleOnchange }: RichTextEditorProps, ref) => {
    const [editorState, setEditorState] = useState("");
    const quillRef = useRef() as React.MutableRefObject<ReactQuill | null>;

    useImperativeHandle(ref, () => ({
      clear: () => {
        const editor = quillRef.current?.getEditor();
        editor?.setText("");
        setEditorState("");
      },
    }));

    const handleEditorChange = (
      content: any,
      delta: any,
      source: any,
      editor: any
    ) => {
      setEditorState(content);
      handleOnchange(content);
    };

    // Defining the toolbar options (customizable)
    const modules = {
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ align: [] }],
        ["clean"], // Clear content button
      ],
    };

    const formats = [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "align",
      "clean",
    ];
    return (
      <ReactQuill
        value={editorState}
        ref={quillRef}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        placeholder="Type your content here..."
        theme="snow" // You can change to "bubble" for a different look
        style={{ height: "500px", marginBottom: "20px" }} // Adjust height as needed
      />
    );
  }
);

export default RichTextEditor;
