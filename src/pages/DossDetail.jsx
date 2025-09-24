import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotification } from '../context/NotificationContext';
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
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DossDetail = () => {
  const { dossId } = useParams();
  const { notify } = useNotification();
  const [doss, setDoss] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newContext, setNewContext] = useState('');

  useEffect(() => {
    const fetchDoss = async () => {
      setIsLoading(true);
      const docRef = doc(db, 'doss', dossId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDoss({ id: docSnap.id, ...docSnap.data() });
      } else {
        notify('Doss not found.', 'error');
      }
      setIsLoading(false);
    };
    fetchDoss();
  }, [dossId, notify]);

  const handleAddContext = async (e) => {
    e.preventDefault();
    if (newContext.trim()) {
      const docRef = doc(db, 'doss', dossId);
      await updateDoc(docRef, {
        context: arrayUnion(newContext.trim())
      });
      setDoss({ ...doss, context: [...(doss.context || []), newContext.trim()] });
      setNewContext('');
      notify('Context added!', 'success');
    }
  };

  const handleDeleteContext = async (contextToDelete) => {
    const docRef = doc(db, 'doss', dossId);
    await updateDoc(docRef, {
      context: arrayRemove(contextToDelete)
    });
    setDoss({ ...doss, context: doss.context.filter(c => c !== contextToDelete) });
    notify('Context removed.', 'info');
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!doss) {
    return <Typography>Doss not found.</Typography>;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        {doss.name}
      </Typography>
      <Divider sx={{ mb: 4 }} />
      <Typography variant="h4" component="h2" gutterBottom>
        Manage Context
      </Typography>
      <Box component="form" onSubmit={handleAddContext} sx={{ display: 'flex', gap: 2, mb: 4 }}>
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {doss.context && doss.context.map((ctx, index) => (
          <Chip
            key={index}
            label={ctx}
            onDelete={() => handleDeleteContext(ctx)}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DossDetail;
