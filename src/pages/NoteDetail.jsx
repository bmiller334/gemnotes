import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, Typography, TextField, Button, CircularProgress, Paper } from '@mui/material';

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

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
        console.log('No such document!');
      }
      setIsLoading(false);
    };
    fetchNote();
  }, [noteId]);

  const handleUpdate = async () => {
    const docRef = doc(db, 'notes', noteId);
    await updateDoc(docRef, {
      title: editedTitle,
      content: editedContent,
      description: editedContent.substring(0, 30) + '...'
    });
    setIsEditing(false);
    // Refetch note to show updated data
    const docSnap = await getDoc(docRef);
     if (docSnap.exists()) {
        setNote({ id: docSnap.id, ...docSnap.data() });
     }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!note) {
    return <Typography>Note not found.</Typography>;
  }

  return (
    <Paper sx={{ p: 4 }}>
      {isEditing ? (
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            variant="standard"
            sx={{ mb: 3, fontSize: '1.75rem' }}
          />
          <TextField
            fullWidth
            label="Content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            multiline
            rows={15}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Save</Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            {note.title}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {note.content}
          </Typography>
          <Button sx={{ mt: 3 }} variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default NoteDetail;
