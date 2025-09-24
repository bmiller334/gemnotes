import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Settings = () => {
  const { doss, addDoss, deleteDoss } = useOutletContext();
  const [newDossName, setNewDossName] = useState("");

  const handleAddDoss = (event) => {
    event.preventDefault();
    if (newDossName.trim()) {
      addDoss(newDossName.trim());
      setNewDossName("");
    }
  };

  return (
    <>
      <Typography variant="h2" component="h1" gutterBottom>
        Settings
      </Typography>
      <Divider sx={{ mb: 4 }} />
      <Typography variant="h4" component="h2" gutterBottom>
        Manage Doss
      </Typography>
      <Box component="form" onSubmit={handleAddDoss} sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="New Doss Name"
          variant="outlined"
          value={newDossName}
          onChange={(e) => setNewDossName(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="contained">
          Add Doss
        </Button>
      </Box>
      <List>
        {doss.map((d) => (
          <ListItem
            key={d.id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => deleteDoss(d.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={d.name} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Settings;
