import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  Typography,
  Fab,
  Menu,
} from "@mui/material";
import RichTextEditor from '../components/RichTextEditor';
import DrawingCanvas from '../components/DrawingCanvas';
import BrushIcon from '@mui/icons-material/Brush';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import AttachmentIcon from '@mui/icons-material/Attachment';

const NewNote = () => {
  const { addNote, doss } = useOutletContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedDoss, setSelectedDoss] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSaveDrawing = async (dataUri) => {
    if (!currentUser) {
      notify("You must be logged in to save drawings.", "error");
      return;
    }
    const fileName = `drawing_${Date.now()}.png`;
    const storageRef = ref(storage, `${currentUser.uid}/${fileName}`);
    
    try {
      await uploadString(storageRef, dataUri, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      setAttachments([...attachments, { name: fileName, url: downloadURL, type: 'drawing' }]);
      notify("Drawing attached successfully!", "success");
    } catch (error) {
      notify("Failed to upload drawing.", "error");
      console.error("Error uploading drawing:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const plainTextContent = new DOMParser().parseFromString(content, 'text/html').body.textContent || "";
    try {
      await addNote({ 
        title, 
        content, 
        description: plainTextContent.substring(0, 100) + "...", 
        dossId: selectedDoss,
        attachments: attachments 
      });
      notify("Do saved successfully!", "success");
      navigate("/dos");
    } catch (error) {
      notify("Failed to save Do.", "error");
      console.error("Error adding note:", error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddDrawingClick = () => {
    setIsDrawingOpen(true);
    handleMenuClose();
  };
  
  const handleAddImageClick = () => {
    notify("Image upload coming soon!", "info");
    handleMenuClose();
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: 'calc(100vh - 120px)' }}
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
          sx={{ '& .MuiInputBase-root': { fontSize: '1.75rem', fontWeight: 'bold' } }}
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
            <MenuItem value=""><em>None (Let Gemini Decide)</em></MenuItem>
            {doss.map((d) => (<MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>))}
          </Select>
        </FormControl>
        
        <RichTextEditor value={content} onChange={setContent} />
        
        {attachments.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Attachments:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {attachments.map((att, index) => (
                <Chip
                  key={index}
                  icon={<AttachmentIcon />}
                  label={att.name}
                  onDelete={() => setAttachments(attachments.filter((_, i) => i !== index))}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'fixed', bottom: 32, right: 32, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Fab size="small" aria-label="add" onClick={handleMenuClick}>
          <AddIcon />
        </Fab>
        <Fab color="primary" aria-label="save" onClick={handleSubmit}>
          <SaveIcon />
        </Fab>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleAddDrawingClick}><BrushIcon sx={{ mr: 1 }} /> Add Drawing</MenuItem>
        <MenuItem onClick={handleAddImageClick}><AddPhotoAlternateIcon sx={{ mr: 1 }} /> Add Image</MenuItem>
      </Menu>

      <DrawingCanvas
        open={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        onSave={handleSaveDrawing}
      />
    </>
  );
};

export default NewNote;
