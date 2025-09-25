import React from 'react';
import ReactQuill from 'react-quill';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['table'],
    ['clean']
  ],
};

// Use React.forwardRef to pass the ref to the ReactQuill component
const RichTextEditor = React.forwardRef(({ value, onChange }, ref) => {
  return (
    <ReactQuill
      ref={ref}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      style={{ height: '300px', marginBottom: '50px' }}
    />
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
