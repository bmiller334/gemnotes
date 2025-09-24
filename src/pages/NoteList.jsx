import { useOutletContext, Link } from "react-router-dom";
import { Typography, Grid, Card, CardActionArea, CardContent, Chip, Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const NoteList = () => {
  const { notes, doss, deleteNote } = useOutletContext();

  const getDossName = (dossId) => {
    if (!dossId) return "Uncategorized";
    if (dossId === "others") return "Others";
    const foundDoss = doss.find(d => d.id === dossId);
    return foundDoss ? foundDoss.name : "Unknown";
  };

  return (
    <>
      <Typography variant="h2" component="h1" gutterBottom>
        All Do's
      </Typography>
      <Grid container spacing={4}>
        {notes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card>
              <CardActionArea component={Link} to={`/dos/${note.id}`}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="h5" component="div" noWrap>
                      {note.title}
                    </Typography>
                    <Chip label={getDossName(note.dossId)} size="small" />
                  </Box>
                  {/* Display the AI-generated summary */}
                  <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}>
                    {note.summary || note.content}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton aria-label="delete" onClick={() => deleteNote(note.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default NoteList;
