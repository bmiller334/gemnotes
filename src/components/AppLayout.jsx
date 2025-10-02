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
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import BookIcon from "@mui/icons-material/Book";
import FolderIcon from '@mui/icons-material/Folder';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import LogoutIcon from '@mui/icons-material/Logout';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import ReloadPrompt from './ReloadPrompt';

const AppLayout = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [doss, setDoss] = useState([]);
  const [tados, setTados] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (currentUser) {
      let notesLoaded, dossLoaded, tadosLoaded, logsLoaded = false;
      const checkLoadingComplete = () => {
        if (notesLoaded && dossLoaded && tadosLoaded && logsLoaded) setIsLoading(false);
      };

      const notesQuery = query(collection(db, "notes"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
        setNotes(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        notesLoaded = true; checkLoadingComplete();
      });

      const dossQuery = query(collection(db, "doss"), where("userId", "==", currentUser.uid));
      const unsubscribeDoss = onSnapshot(dossQuery, (snapshot) => {
        setDoss(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        dossLoaded = true; checkLoadingComplete();
      });

      const tadosQuery = query(collection(db, "tados"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      const unsubscribeTados = onSnapshot(tadosQuery, (snapshot) => {
        setTados(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        tadosLoaded = true; checkLoadingComplete();
      });

      const logsQuery = query(collection(db, "gemini_logs"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("Gemini Log:", change.doc.data());
          }
        });
        logsLoaded = true; checkLoadingComplete();
      });


      return () => { unsubscribeNotes(); unsubscribeDoss(); unsubscribeTados(); unsubscribeLogs(); };
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);
  
  const handleLogout = async () => { await signOut(auth); navigate('/login'); };
  const addNote = async (note) => await addDoc(collection(db, "notes"), { ...note, createdAt: serverTimestamp(), userId: currentUser.uid });
  const deleteNote = async (noteId) => await deleteDoc(doc(db, "notes", noteId));
  const addDoss = async (dossName) => await addDoc(collection(db, "doss"), { name: dossName, userId: currentUser.uid, context: [] });
  const deleteDoss = async (dossId) => await deleteDoc(doc(db, "doss", dossId));
  const addContextToDoss = async (dossId, context) => await updateDoc(doc(db, "doss", dossId), { context: arrayUnion(context) });
  const deleteContextFromDoss = async (dossId, context) => await updateDoc(doc(db, "doss", dossId), { context: arrayRemove(context) });
  const toggleTado = async (tadoId, completed) => await updateDoc(doc(db, "tados", tadoId), { completed });
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
  };
  
  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => setInstallPrompt(null));
    }
  };
  
  const menuItems = [
    { text: "New Do", icon: <HomeIcon />, path: "/" },
    { text: "All Do's", icon: <BookIcon />, path: "/dos" },
    { text: "All Doss", icon: <FolderIcon />, path: "/doss" },
    { text: "Tado's", icon: <PlaylistAddCheckIcon />, path: "/tados" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer(true)}><MenuIcon /></IconButton>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>Dosser</Typography>
          {installPrompt && <Tooltip title="Install App"><IconButton color="inherit" onClick={handleInstallClick}><InstallMobileIcon /></IconButton></Tooltip>}
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
        <Outlet context={{ notes, addNote, deleteNote, doss, addDoss, deleteDoss, addContextToDoss, deleteContextFromDoss, tados, toggleTado }} />
      </Container>
      
      <ReloadPrompt />
    </>
  );
};

export default AppLayout;