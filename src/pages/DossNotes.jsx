import { Typography, Grid, Card, CardContent, Box, Chip } from "@mui/material";
import { useParams, useOutletContext } from "react-router-dom";

const DossNotes = () => {
  const { dossId } = useParams();
  const { notes, doss } = useOutletContext();

  // Find the name of the current Doss
  const currentDoss = doss.find(d => d.id === dossId);
  const dossName = currentDoss ? currentDoss.name : dossId;

  // Filter the notes to show only those belonging to the current Doss
  const filteredNotes = notes.filter(note => note.dossId === dossId);

  return (
    <>
      <Typography variant="h2" component="h1" gutterBottom>
        Do's in Doss: {dossName}
      </Typography>
      <Grid container spacing={4}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="h5" component="div">
                      {note.title}
                    </Typography>
                    <Chip label={dossName} size="small" />
                  </Box>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {note.description}
                  </Typography>
                  <Typography variant="body2">
                    {note.content}
                  </Typography>
                </CardContent>
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
