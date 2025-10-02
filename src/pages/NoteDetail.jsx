import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, Typography, Button, CircularProgress, Paper, TextField, Divider, Link } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import RichTextEditor from '../components/RichTextEditor';

const NoteDetail = () => {
  const { noteId } = useParams();
  const { notify } = useNotification();
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

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!note) {
    return <Typography>Note not found.</Typography>;
  }

  return (
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
          <RichTextEditor value={editedContent} onChange={setEditedContent} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
            sx={{ flexGrow: 1, overflowY: 'auto', p: 0, mb: 4 }}
          />
          
          {/* Display Attachments */}
          {note.attachments && note.attachments.length > 0 && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Attachments
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {note.attachments.map((att, index) => (
                  <Link href={att.url} target="_blank" rel="noopener noreferrer" key={index}>
                    <img src={att.url} alt={`Attachment ${index + 1}`} width="150" style={{ border: '1px solid #ccc', borderRadius: '8px' }}/>
                  </Link>
                ))}
              </Box>
            </>
          )}

          <Button sx={{ mt: 3 }} variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default NoteDetail;
