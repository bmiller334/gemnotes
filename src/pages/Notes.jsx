import { useOutletContext } from "react-router-dom";
import { Typography, Grid, Card, CardContent, Chip, Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Notes = () => {
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
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="h5" component="div">
                    {note.title}
                  </Typography>
                  <Chip label={getDossName(note.dossId)} size="small" />
                </Box>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {note.description}
                </Typography>
                <Typography variant="body2">
                  {note.content}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  <IconButton aria-label="delete" onClick={() => deleteNote(note.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Notes;
