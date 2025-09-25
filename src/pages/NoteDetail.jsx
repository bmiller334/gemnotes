import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, Typography, Button, CircularProgress, Paper, TextField, IconButton, Tooltip } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import RichTextEditor from '../components/RichTextEditor';
import DrawingCanvas from '../components/DrawingCanvas';
import BrushIcon from '@mui/icons-material/Brush';

const NoteDetail = () => {
  const { noteId } = useParams();
  const { notify } = useNotification();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const quillRef = useRef(null); // To get access to the editor instance

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      const docRef = doc(db, 'notes', noteId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const noteData = { id: docSnap.id, ...docSnap.data() };
        setNote(noteData);
        setEditedTitle(noteData.title);
        setEditedContent(noteData.content);
      } else {
        notify('Note not found.', 'error');
      }
      setIsLoading(false);
    };
    fetchNote();
  }, [noteId, notify]);

  const handleUpdate = async () => {
    const docRef = doc(db, 'notes', noteId);
    const plainTextContent = new DOMParser().parseFromString(editedContent, 'text/html').body.textContent || "";
    await updateDoc(docRef, {
      title: editedTitle,
      content: editedContent,
      description: plainTextContent.substring(0, 100) + '...'
    });
    setIsEditing(false);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
       setNote({ id: docSnap.id, ...docSnap.data() });
    }
    notify("Do updated successfully!", "success");
  };

  const handleSaveDrawing = (dataUri) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    // Insert the image at the current cursor position
    editor.insertEmbed(range.index, 'image', dataUri);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!note) {
    return <Typography>Note not found.</Typography>;
  }

  return (
    <>
      <Paper sx={{ p: 4, mt: 2 }}>
        {isEditing ? (
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              variant="standard"
              sx={{ mb: 3, '& .MuiInputBase-root': { fontSize: '1.75rem', fontWeight: 'bold' } }}
            />
            <RichTextEditor ref={quillRef} value={editedContent} onChange={setEditedContent} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Add Drawing">
                <IconButton onClick={() => setIsDrawingOpen(true)}>
                  <BrushIcon />
                </IconButton>
              </Tooltip>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {note.title}
            </Typography>
            <Box
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: note.content }}
              sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}
            />
            <Button sx={{ mt: 3 }} variant="contained" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Box>
        )}
      </Paper>

      <DrawingCanvas
        open={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        onSave={handleSaveDrawing}
      />
    </>
  );
};

export default NoteDetail;
