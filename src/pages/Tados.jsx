import { useOutletContext } from 'react-router-dom';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Paper
} from '@mui/material';

const Tados = () => {
  const { tados, toggleTado } = useOutletContext();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Tado's Feed
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        This is an automatically generated feed of tasks identified by the AI from your Do's.
      </Typography>
      <List>
        {(tados || []).map((tado) => (
          <ListItem
            key={tado.id}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={() => toggleTado(tado.id, !tado.completed)}
                checked={tado.completed}
              />
            }
            disablePadding
          >
            <ListItemText 
              primary={tado.task} 
              secondary={`From Doss: ${tado.dossName || 'Unknown'}`} 
              sx={{ textDecoration: tado.completed ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Tados;