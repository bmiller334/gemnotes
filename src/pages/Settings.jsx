import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
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
  const { notify } = useNotification();
  const [newDossName, setNewDossName] = useState("");

  const handleAddDoss = async (event) => {
    event.preventDefault();
    if (newDossName.trim()) {
      try {
        await addDoss(newDossName.trim());
        notify("Doss created successfully!", "success");
        setNewDossName("");
      } catch (error) {
        notify("Failed to create Doss.", "error");
        console.error("Error adding doss:", error);
      }
    }
  };

  const handleDeleteDoss = async (dossId) => {
    try {
      await deleteDoss(dossId);
      notify("Doss deleted.", "info");
    } catch (error) {
      notify("Failed to delete Doss.", "error");
      console.error("Error deleting doss:", error);
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
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDoss(d.id)}>
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
