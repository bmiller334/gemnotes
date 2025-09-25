import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp, query, where, orderBy, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Container,
  Box,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import BookIcon from "@mui/icons-material/Book";
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import ReloadPrompt from './ReloadPrompt';

const AppLayout = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [doss, setDoss] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If there is a user, set up the real-time listeners.
    // The UI will render immediately with empty arrays, then update as data arrives.
    if (currentUser) {
      const notesQuery = query(collection(db, "notes"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      const unsubscribeNotes = onSnapshot(notesQuery, 
        (snapshot) => {
          setNotes(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        },
        (error) => {
          console.error("Error fetching notes:", error);
        }
      );

      const dossQuery = query(collection(db, "doss"), where("userId", "==", currentUser.uid));
      const unsubscribeDoss = onSnapshot(dossQuery, 
        (snapshot) => {
          setDoss(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        },
        (error) => {
          console.error("Error fetching doss:", error);
        }
      );

      // Clean up the listeners on component unmount
      return () => {
        unsubscribeNotes();
        unsubscribeDoss();
      };
    }
  }, [currentUser]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const addNote = async (note) => {
    await addDoc(collection(db, "notes"), { ...note, createdAt: serverTimestamp(), userId: currentUser.uid });
  };
  const deleteNote = async (noteId) => {
    await deleteDoc(doc(db, "notes", noteId));
  };
  const addDoss = async (dossName) => {
    await addDoc(collection(db, "doss"), { name: dossName, userId: currentUser.uid, context: [] });
  };
  const deleteDoss = async (dossId) => {
    await deleteDoc(doc(db, "doss", dossId));
  };
  const addContextToDoss = async (dossId, context) => {
    const docRef = doc(db, "doss", dossId);
    await updateDoc(docRef, {
      context: arrayUnion(context)
    });
  };
  const deleteContextFromDoss = async (dossId, context) => {
    const docRef = doc(db, "doss", dossId);
    await updateDoc(docRef, {
      context: arrayRemove(context)
    });
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
  };
  
  const menuItems = [
    { text: "New Do", icon: <HomeIcon />, path: "/" },
    { text: "All Do's", icon: <BookIcon />, path: "/dos" },
    { text: "All Doss", icon: <FolderIcon />, path: "/doss" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            Dosser
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton key={item.text} onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
            <Divider />
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Container sx={{ mt: 4 }}>
        <Outlet context={{ notes, addNote, deleteNote, doss, addDoss, deleteDoss, addContextToDoss, deleteContextFromDoss }} />
      </Container>
      
      <ReloadPrompt />
    </>
  );
};

export default AppLayout;
