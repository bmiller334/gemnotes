import { Typography, List, ListItemButton, ListItemText, Divider } from "@mui/material";
import { Link, useOutletContext } from "react-router-dom";

const Doss = () => {
  const { doss } = useOutletContext();

  return (
    <>
      <Typography variant="h2" component="h1" gutterBottom>
        All Doss
      </Typography>
      <List>
        {doss.map((d) => (
          <ListItemButton component={Link} to={`/doss/${d.id}`} key={d.id}>
            <ListItemText primary={d.name} />
          </ListItemButton>
        ))}
         <Divider sx={{ my: 1 }} />
         <ListItemButton component={Link} to="/doss/others">
            <ListItemText primary="Others" />
          </ListItemButton>
      </List>
    </>
  );
};

export default Doss;
