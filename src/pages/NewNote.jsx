import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const NewNote = () => {
  const { addNote, doss } = useOutletContext();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedDoss, setSelectedDoss] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    addNote({ title, content, description: content.substring(0, 30) + "...", dossId: selectedDoss });
    navigate("/dos");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="do-title"
        label="Do Title"
        variant="standard"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{
          '& .MuiInput-underline:before': { borderBottomColor: 'grey.400' },
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' },
          '& .MuiInputBase-root': { fontSize: '1.5rem' },
          '& .MuiInputLabel-root': { fontSize: '1.5rem' },
        }}
      />
      <FormControl fullWidth>
        <InputLabel id="doss-select-label">Doss</InputLabel>
        <Select
          labelId="doss-select-label"
          id="doss-select"
          value={selectedDoss}
          label="Doss"
          onChange={(e) => setSelectedDoss(e.target.value)}
        >
          <MenuItem value="">
            <em>None (Let Gemini Decide)</em>
          </MenuItem>
          {doss.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        id="do-content"
        label="Start writing..."
        variant="outlined"
        multiline
        rows={15}
        fullWidth
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button type="submit" variant="contained" size="large" sx={{ alignSelf: 'flex-end' }}>
        Save Do
      </Button>
    </Box>
  );
};

export default NewNote;
