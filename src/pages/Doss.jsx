import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Divider,
  ListItemButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNotification } from '../context/NotificationContext';

const Doss = () => {
  const { doss, addContextToDoss, deleteContextFromDoss } = useOutletContext();
  const { notify } = useNotification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoss, setSelectedDoss] = useState(null);
  const [newContext, setNewContext] = useState('');

  const handleOpenDialog = (d) => {
    setSelectedDoss(d);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDoss(null);
    setNewContext('');
  };

  const handleAddContext = async (e) => {
    e.preventDefault();
    if (newContext.trim() && selectedDoss) {
      try {
        await addContextToDoss(selectedDoss.id, newContext.trim());
        setNewContext('');
        notify('Context added!', 'success');
      } catch (error) {
        notify('Failed to add context.', 'error');
        console.error('Error adding context:', error);
      }
    }
  };
  
  const handleDeleteContext = async (contextToDelete) => {
    if (selectedDoss) {
        try {
            await deleteContextFromDoss(selectedDoss.id, contextToDelete);
            notify('Context removed.', 'info');
        } catch (error) {
            notify('Failed to remove context.', 'error');
            console.error('Error deleting context:', error);
        }
    }
  };

  return (
    <>
      <Typography variant="h2" component="h1" gutterBottom>
        All Doss
      </Typography>
      <List>
        {doss.map((d) => (
          <ListItem
            key={d.id}
            secondaryAction={
              <IconButton edge="end" aria-label="edit context" onClick={() => handleOpenDialog(d)}>
                <EditIcon />
              </IconButton>
            }
            disablePadding
          >
            <ListItemButton component={Link} to={`/doss/${d.id}`}>
              <ListItemText primary={d.name} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItemButton component={Link} to="/doss/others">
            <ListItemText primary="Others" />
        </ListItemButton>
      </List>

      {/* Context Management Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Manage Context for "{selectedDoss?.name}"</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddContext} sx={{ display: 'flex', gap: 2, my: 2 }}>
            <TextField
              label="Add a context word or phrase"
              variant="outlined"
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              size="small"
              fullWidth
            />
            <Button type="submit" variant="contained">
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {(selectedDoss?.context || []).map((ctx, index) => (
              <Chip
                key={index}
                label={ctx}
                onDelete={() => handleDeleteContext(ctx)}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Doss;
