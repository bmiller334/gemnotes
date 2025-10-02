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
  Fab,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNotification } from '../context/NotificationContext';

const Doss = () => {
  const { doss, addDoss, addContextToDoss, deleteContextFromDoss } = useOutletContext();
  const { notify } = useNotification();
  
  // State for Context Dialog
  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false);
  const [selectedDoss, setSelectedDoss] = useState(null);
  const [newContext, setNewContext] = useState('');

  // State for Add Doss Dialog
  const [isAddDossDialogOpen, setIsAddDossDialogOpen] = useState(false);
  const [newDossName, setNewDossName] = useState('');

  const handleOpenContextDialog = (d) => {
    setSelectedDoss(d);
    setIsContextDialogOpen(true);
  };

  const handleCloseContextDialog = () => {
    setIsContextDialogOpen(false);
    setSelectedDoss(null);
    setNewContext('');
  };

  const handleAddContext = async (e) => {
    e.preventDefault();
    if (newContext.trim() && selectedDoss) {
      await addContextToDoss(selectedDoss.id, newContext.trim());
      setNewContext('');
      notify('Context added!', 'success');
    }
  };
  
  const handleDeleteContext = async (contextToDelete) => {
    if (selectedDoss) {
        await deleteContextFromDoss(selectedDoss.id, contextToDelete);
        notify('Context removed.', 'info');
    }
  };

  const handleOpenAddDossDialog = () => {
    setIsAddDossDialogOpen(true);
  };

  const handleCloseAddDossDialog = () => {
    setIsAddDossDialogOpen(false);
    setNewDossName('');
  };

  const handleAddDoss = async () => {
    if (newDossName.trim()) {
      await addDoss(newDossName.trim());
      notify('Doss created!', 'success');
      handleCloseAddDossDialog();
    } else {
      notify('Doss name cannot be empty.', 'warning');
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
              <Tooltip title="Edit Context">
                <IconButton edge="end" aria-label="edit context" onClick={() => handleOpenContextDialog(d)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            }
            disablePadding
          >
            <ListItem button component={Link} to={`/doss/${d.id}/manage`}>
              <ListItemText primary={d.name} />
            </ListItem>
          </ListItem>
        ))}
      </List>

      {/* Context Management Dialog */}
      <Dialog open={isContextDialogOpen} onClose={handleCloseContextDialog} fullWidth maxWidth="sm">
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
            <Button type="submit" variant="contained">Add</Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {(selectedDoss?.context || []).map((ctx, index) => (
              <Chip key={index} label={ctx} onDelete={() => handleDeleteContext(ctx)} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContextDialog}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Add Doss Dialog */}
      <Dialog open={isAddDossDialogOpen} onClose={handleCloseAddDossDialog}>
        <DialogTitle>Create a New Doss</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Doss Name"
            type="text"
            fullWidth
            variant="standard"
            value={newDossName}
            onChange={(e) => setNewDossName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddDoss()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDossDialog}>Cancel</Button>
          <Button onClick={handleAddDoss}>Create</Button>
        </DialogActions>
      </Dialog>

      <Tooltip title="Create New Doss">
        <Fab
            color="primary"
            aria-label="add"
            sx={{
                position: 'fixed',
                bottom: (theme) => theme.spacing(4),
                right: (theme) => theme.spacing(4),
            }}
            onClick={handleOpenAddDossDialog}
        >
            <AddIcon />
        </Fab>
      </Tooltip>
    </>
  );
};

export default Doss;