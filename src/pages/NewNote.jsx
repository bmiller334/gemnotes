import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import RichTextEditor from '../components/RichTextEditor';

const NewNote = () => {
  const { addNote, doss } = useOutletContext();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // This will now hold HTML content
  const [selectedDoss, setSelectedDoss] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Create a plain text description for the card view
    const plainTextContent = new DOMParser().parseFromString(content, 'text/html').body.textContent || "";
    try {
      await addNote({ title, content, description: plainTextContent.substring(0, 100) + "...", dossId: selectedDoss });
      notify("Do saved successfully!", "success");
      navigate("/dos");
    } catch (error) {
      notify("Failed to save Do.", "error");
      console.error("Error adding note:", error);
    }
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
          '& .MuiInputBase-root': { fontSize: '1.75rem', fontWeight: 'bold' },
          '& .MuiInputLabel-root': { fontSize: '1.75rem' },
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
      
      <RichTextEditor value={content} onChange={setContent} />
      
      <Button type="submit" variant="contained" size="large" sx={{ alignSelf: 'flex-end' }}>
        Save Do
      </Button>
    </Box>
  );
};

export default NewNote;
