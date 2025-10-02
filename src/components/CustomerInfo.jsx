import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, collection, query, addDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { db } from '../firebase';
import { useNotification } from '../context/NotificationContext';
import {
  Typography, Box, TextField, Button, IconButton, Collapse, Paper, Grid, Divider,
  Select, MenuItem, InputLabel, FormControl, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, List, ListItem, ListItemText, ListItemIcon, LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const CustomerInfo = ({ doss }) => {
  const { notify } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({});
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [equipment, setEquipment] = useState([]); // Now for the new subcollection
  const [newEquipment, setNewEquipment] = useState({ name: '', model: '', serial: '', group: 'Default' });
  const [equipmentGroups, setEquipmentGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const defaultGroups = ['Parlor', 'Equipment Room', 'Milk Room', 'Housing', 'Hospital', 'Default'];

  useEffect(() => {
    // Set customer details and groups from parent
    setCustomerDetails(doss.customerInfo || { pointsOfContact: [], address: '' });
    setEquipmentGroups(doss.equipmentGroups && doss.equipmentGroups.length > 0 ? doss.equipmentGroups : defaultGroups);
    if (!doss.customerInfo) setIsEditing(true);

    // Real-time listener for the equipment subcollection
    const equipmentQuery = query(collection(db, "doss", doss.id, "equipment"));
    const unsubscribe = onSnapshot(equipmentQuery, (snapshot) => {
        const equipmentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEquipment(equipmentData);
    });

    return () => unsubscribe();
  }, [doss]);

  const handleSaveCustomerInfo = async () => {
    const docRef = doc(db, 'doss', doss.id);
    try {
      await updateDoc(docRef, { customerInfo: customerDetails, equipmentGroups });
      setIsEditing(false);
      notify('Customer Information updated!', 'success');
    } catch (error) {
      notify('Failed to update info.', 'error');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storage = getStorage();
    const filePath = `unprocessed_dataplates/${doss.id}/${Date.now()}-${file.name}`;
    const metadata = { customMetadata: { dossId: doss.id, userId: doss.userId, filePath } };
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on('state_changed', 
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100), 
        (error) => { notify('Upload failed!', 'error'); setUploadProgress(0); }, 
        () => { notify('Upload complete! Extracting text...', 'info'); setUploadProgress(0); }
    );
  };

  const handleAddManualEquipment = async () => {
      if (!newEquipment.model && !newEquipment.serial) return notify("Model or Serial must be provided.", "warning");
      await addDoc(collection(db, "doss", doss.id, "equipment"), {
          ...newEquipment,
          userId: doss.userId,
          dossId: doss.id,
          createdAt: new Date(),
          specs: {} // manual entries don't have specs unless added
      });
      setNewEquipment({ name: '', model: '', serial: '', group: 'Default' });
  };

  const handleDeleteEquipment = async (equipmentId) => {
      await deleteDoc(doc(db, "doss", doss.id, "equipment", equipmentId));
      notify("Equipment removed.", "info");
  };

  // Contact handlers remain the same
  const handleAddContact = () => { if (newContact.name && newContact.phone) { setCustomerDetails(prev => ({ ...prev, pointsOfContact: [...(prev.pointsOfContact || []), newContact] })); setNewContact({ name: '', phone: '', email: '' }); }};
  const handleDeleteContact = (index) => setCustomerDetails(prev => ({ ...prev, pointsOfContact: prev.pointsOfContact.filter((_, i) => i !== index) }));
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">Customer Information</Typography>
        <Box>
            <IconButton onClick={isEditing ? handleSaveCustomerInfo : () => setIsEditing(true)}>{isEditing ? <SaveIcon /> : <EditIcon />}</IconButton>
            {isEditing && <IconButton onClick={() => setIsEditing(false)}><CloseIcon /></IconButton>}
        </Box>
      </Box>

      {/* VIEW MODE */}
      <Collapse in={!isEditing}>
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography><b>Address:</b> {customerDetails.address}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Points of Contact</Typography>
            {/* Contact Table */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Equipment</Typography>
            {equipmentGroups.map(groupName => {
                const groupEquipment = equipment.filter(e => e.group === groupName);
                if (groupEquipment.length === 0) return null;
                return (
                    <Box key={groupName} sx={{mb: 2}}>
                        <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>{groupName}</Typography>
                        {groupEquipment.map(item => (
                            <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 1}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body1"><b>{item.name || 'Equipment'}</b></Typography>
                                    <Chip label={item.group} size="small" />
                                </Box>
                                <Typography><b>Model:</b> {item.model}</Typography>
                                <Typography><b>Serial:</b> {item.serial}</Typography>
                                {Object.entries(item.specs).map(([key, value]) => (
                                    <Typography key={key}><b>{key}:</b> {String(value)}</Typography>
                                ))}
                            </Paper>
                        ))}
                    </Box>
                );
            })}
        </Paper>
      </Collapse>

      {/* EDIT MODE */}
      <Collapse in={isEditing}>
        <Paper variant="outlined" sx={{ p: 2 }}>
            {/* Contact & Address Editing */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">Manage Equipment</Typography>
            
            <Box sx={{ p: 2, mb: 2, border: '1px dashed grey', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>Scan Data Plate via Image</Typography>
                <Button component="label" variant="outlined" startIcon={<CameraAltIcon />} disabled={uploadProgress > 0}>
                    Upload Image
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />}
            </Box>

            <Typography variant="subtitle2" sx={{mb: 1}}>Or, Add Manually:</Typography>
            {equipment.map(item => (
                <Paper key={item.id} sx={{p:1, mb:1, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <Typography>{item.name || item.model}</Typography>
                    <IconButton size="small" onClick={() => handleDeleteEquipment(item.id)}><DeleteIcon/></IconButton>
                </Paper>
            ))}
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}><TextField label="Name (Optional)" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} fullWidth/></Grid>
                <Grid item xs={12} sm={3}><TextField label="Model" value={newEquipment.model} onChange={e => setNewEquipment({...newEquipment, model: e.target.value})} fullWidth/></Grid>
                <Grid item xs={12} sm={3}><TextField label="Serial" value={newEquipment.serial} onChange={e => setNewEquipment({...newEquipment, serial: e.target.value})} fullWidth/></Grid>
                <Grid item xs={12} sm={2}><FormControl fullWidth><InputLabel>Group</InputLabel><Select value={newEquipment.group} label="Group" onChange={e => setNewEquipment({...newEquipment, group: e.target.value})}>{equipmentGroups.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={1}><Button onClick={handleAddManualEquipment} variant="contained" sx={{width: '100%'}}><AddIcon/></Button></Grid>
            </Grid>
            <Button onClick={handleSaveCustomerInfo} variant="contained" sx={{ mt: 3, display: 'block', width: '100%' }}>Save Customer Info</Button>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default CustomerInfo;