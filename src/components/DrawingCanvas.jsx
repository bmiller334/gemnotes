import { useRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ClearIcon from '@mui/icons-material/Clear';

const DrawingCanvas = ({ open, onClose, onSave }) => {
  const canvasRef = useRef(null);

  const handleSave = async () => {
    if (canvasRef.current) {
      const dataUri = await canvasRef.current.exportImage('png');
      onSave(dataUri);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create a Drawing</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 1 }}>
            <Tooltip title="Undo">
                <IconButton onClick={() => canvasRef.current?.undo()}>
                    <UndoIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
                <IconButton onClick={() => canvasRef.current?.redo()}>
                    <RedoIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Clear">
                <IconButton onClick={() => canvasRef.current?.clearCanvas()}>
                    <ClearIcon />
                </IconButton>
            </Tooltip>
        </Box>
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={4}
            strokeColor="black"
            width="100%"
            height="400px"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Drawing</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrawingCanvas;
