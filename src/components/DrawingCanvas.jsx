import { useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Tooltip,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ClearIcon from '@mui/icons-material/Clear';
import DrawIcon from '@mui/icons-material/Draw';
import EraserIcon from '@mui/icons-material/HighlightOff';

const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFFF00']; // Black, Red, Blue, Green, Yellow

const DrawingCanvas = ({ open, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [tool, setTool] = useState('pen');

  const handleSave = async () => {
    if (canvasRef.current) {
      const dataUri = await canvasRef.current.exportImage('png');
      onSave(dataUri);
      onClose();
    }
  };

  const handleToolChange = (event, newTool) => {
    if (newTool !== null) {
      setTool(newTool);
      if (newTool === 'eraser') {
        canvasRef.current?.eraseMode(true);
      } else {
        canvasRef.current?.eraseMode(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create a Drawing</DialogTitle>
      <DialogContent>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2, p:1, border: '1px solid #ccc', borderRadius: 1}}>
          <ToggleButtonGroup
            value={tool}
            exclusive
            onChange={handleToolChange}
            aria-label="drawing tool"
            size="small"
          >
            <ToggleButton value="pen" aria-label="pen">
              <Tooltip title="Pen"><DrawIcon /></Tooltip>
            </ToggleButton>
            <ToggleButton value="eraser" aria-label="eraser">
              <Tooltip title="Eraser"><EraserIcon /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {colors.map(color => (
              <Button key={color} onClick={() => setStrokeColor(color)} style={{ backgroundColor: color, minWidth: '30px', height: '30px', border: strokeColor === color ? '2px solid #2196f3' : '1px solid #ccc' }} />
            ))}
          </Box>
          
          <Box sx={{ width: 150, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption">Size:</Typography>
            <Slider value={strokeWidth} onChange={(e, val) => setStrokeWidth(val)} min={1} max={30} size="small" />
          </Box>

          <Box>
            <Tooltip title="Undo"><IconButton onClick={() => canvasRef.current?.undo()}><UndoIcon /></IconButton></Tooltip>
            <Tooltip title="Redo"><IconButton onClick={() => canvasRef.current?.redo()}><RedoIcon /></IconButton></Tooltip>
            <Tooltip title="Clear"><IconButton onClick={() => canvasRef.current?.clearCanvas()}><ClearIcon /></IconButton></Tooltip>
          </Box>
        </Box>
        
        {/* Canvas */}
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            width="100%"
            height="450px"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Add Drawing to Do</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrawingCanvas;
