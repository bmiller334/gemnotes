import { Typography, Grid, Card, CardActionArea, CardContent, Box, Chip, IconButton, FormGroup, FormControlLabel, Checkbox, Divider, Paper } from "@mui/material";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotification } from "../context/NotificationContext";

const DossNotes = () => {
  const { dossId } = useParams();
  const { notes, doss, deleteNote } = useOutletContext();
  const { notify } = useNotification();

  const currentDoss = doss.find(d => d.id === dossId);
  const dossName = currentDoss ? currentDoss.name : dossId;
  const filteredNotes = notes.filter(note => note.dossId === dossId);

  const actionItems = filteredNotes
    .filter(note => note.actionItems && note.actionItems.length > 0)
    .flatMap(note => 
      note.actionItems.map(item => ({
        ...item,
        noteId: note.id,
        noteTitle: note.title,
        createdAt: note.createdAt?.toDate()
      }))
    );

  actionItems.sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.createdAt - b.createdAt;
  });

  const handleToggleActionItem = async (item) => {
    const noteRef = doc(db, 'notes', item.noteId);
    const noteToUpdate = notes.find(n => n.id === item.noteId);
    if (noteToUpdate) {
      const updatedActionItems = noteToUpdate.actionItems.map(ai => 
        ai.task === item.task ? { ...ai, completed: !ai.completed } : ai
      );
      await updateDoc(noteRef, { actionItems: updatedActionItems });
      notify("Action item updated!", "success");
    }
  };

  return (
    <>
      <Typography variant="h2" component="h1" gutterBottom>
        Do's in Doss: {dossName}
      </Typography>

      {actionItems.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Action Do's
          </Typography>
          <FormGroup>
            {actionItems.map((item, index) => (
              <FormControlLabel 
                key={index}
                control={<Checkbox checked={item.completed} onChange={() => handleToggleActionItem(item)} />}
                label={`${item.task} (from: ${item.noteTitle})`} 
              />
            ))}
          </FormGroup>
        </Paper>
      )}

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={4}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardActionArea component={Link} to={`/dos/${note.id}`} sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h5" component="div" noWrap>
                        {note.title}
                      </Typography>
                      <Chip label={dossName} size="small" />
                    </Box>
                    <Box
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        '&.ql-editor': { p: 0, fontSize: '0.875rem' }
                      }}
                      className="ql-editor"
                      dangerouslySetInnerHTML={{ __html: note.summary || note.content }}
                    />
                  </CardContent>
                </CardActionArea>
                 <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                  <IconButton aria-label="delete" onClick={() => deleteNote(note.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              There are no Do's in this Doss yet.
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default DossNotes;
