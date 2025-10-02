import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotification } from '../context/NotificationContext';
import {
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Checkbox
} from '@mui/material';
import CustomerInfo from '../components/CustomerInfo';

const DossDetail = () => {
  const { dossId } = useParams();
  const { notify } = useNotification();
  const { tados, toggleTado } = useOutletContext();
  const [doss, setDoss] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newContext, setNewContext] = useState('');

  const relevantTados = tados?.filter(tado => tado.dossId === dossId) || [];

  useEffect(() => {
    setIsLoading(true);
    const docRef = doc(db, 'doss', dossId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setDoss({ id: docSnap.id, ...docSnap.data() });
      } else {
        notify('Doss not found.', 'error');
        setDoss(null);
      }
      setIsLoading(false);
    }, (error) => {
        notify('Failed to load dossier.', 'error');
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [dossId, notify]);

  const handleAddContext = async (e) => {
    e.preventDefault();
    if (newContext.trim()) {
      const docRef = doc(db, 'doss', dossId);
      await updateDoc(docRef, { context: arrayUnion(newContext.trim()) });
      setNewContext('');
      notify('Context added!', 'success');
    }
  };

  const handleDeleteContext = async (contextToDelete) => {
    const docRef = doc(db, 'doss', dossId);
    await updateDoc(docRef, { context: arrayRemove(contextToDelete) });
    notify('Context removed.', 'info');
  };

  if (isLoading) return <CircularProgress />;
  if (!doss) return <Typography>Doss not found.</Typography>;

  return (
    <Paper sx={{ p: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>{doss.name}</Typography>
        <Divider sx={{ mb: 4 }} />

        {relevantTados.length > 0 && (
            <>
                <Typography variant="h4" component="h2" gutterBottom>Relevant Tado's</Typography>
                <List component={Paper} variant="outlined" dense sx={{ mb: 4 }}>
                    {relevantTados.map(tado => (
                        <ListItem key={tado.id} secondaryAction={
                            <Checkbox edge="end" onChange={() => toggleTado(tado.id, !tado.completed)} checked={tado.completed} />
                        }>
                            <ListItemText primary={tado.task} sx={{ textDecoration: tado.completed ? 'line-through' : 'none' }} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ mb: 4 }} />
            </>
        )}

        <CustomerInfo doss={doss} />
        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" component="h2" gutterBottom>Manage Context</Typography>
        <Box component="form" onSubmit={handleAddContext} sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField label="Add context" variant="outlined" value={newContext} onChange={(e) => setNewContext(e.target.value)} size="small" fullWidth />
            <Button type="submit" variant="contained">Add</Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(doss.context || []).map((ctx, index) => (
              <Chip key={index} label={ctx} onDelete={() => handleDeleteContext(ctx)} />
            ))}
        </Box>
    </Paper>
  );
};

export default DossDetail;