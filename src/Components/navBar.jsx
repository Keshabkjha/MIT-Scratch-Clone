import React, { useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Logo from '../Assets/images/Logo.png';
import { PAGES } from '../constants';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export const NavBar = ({ projectName, onProjectNameChange, savedAtLabel, onSave, onLoad, onExport, onImport }) => {
  const handleCloseNavMenu = () => {};
  const fileInputRef = useRef(null);

  const handleFilePick = (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }
    if (onImport) {
      onImport(file);
    }
    event.target.value = '';
  };

  return (
    <AppBar position="static" sx={{backgroundColor : '#4d97ff'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ flexWrap: 'wrap', gap: 1, py: 1 }}>
          <Box
             sx={{
                mr:5,
                mt:1,
                ml:5,
                display: { xs: 'none', md: 'flex' },
              }}
          >
            <img src={Logo} alt="Logo" style={{ height: '50px', display: 'flex'}} />
          </Box>  
          <Box
             sx={{
                mr: '30%',
                ml: '35%',
                display: { xs: 'flex', md: 'none' },
              }}
          >
            <img src={Logo} alt="Logo" style={{ height: '50px', display: 'flex'}} />
          </Box>  
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {PAGES.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box
            sx={{
              flexGrow: 0,
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              gap: { xs: 1.5, md: 0 },
              width: { xs: '100%', md: 'auto' }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, mr: { xs: 0, md: 2 } }}>
              <TextField
                size="small"
                value={projectName}
                onChange={(event) => onProjectNameChange?.(event.target.value)}
                placeholder="Project name"
                variant="outlined"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                  minWidth: { xs: '100%', sm: 180 }
                }}
                inputProps={{ maxLength: 40 }}
              />
              <span style={{ color: 'white', fontSize: '12px', opacity: 0.9 }}>
                {savedAtLabel}
              </span>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mr: { xs: 0, md: 3 }, flexWrap: 'wrap' }}>
              <Button variant="contained" color="success" size="small" onClick={onSave}>💾 Save</Button>
              <Button variant="contained" color="info" size="small" onClick={onLoad}>📂 Load</Button>
              <Button variant="contained" color="secondary" size="small" onClick={onExport}>⬇️ Export</Button>
              <Button variant="contained" color="primary" size="small" onClick={() => fileInputRef.current?.click()}>⬆️ Import</Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFilePick}
                style={{ display: 'none' }}
              />
            </Box>
            {/* Social Icons */}
            <a href="https://github.com/Keshabkjha" target="_blank" rel="noopener noreferrer" style={{ color: 'white', marginRight: 16, fontSize: 28, display: 'flex', alignItems: 'center' }} title="GitHub">
              <FaGithub style={{ transition: 'color 0.2s' }} className="hover:text-gray-300" />
            </a>
            <a href="https://www.linkedin.com/in/keshabkjha/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', marginRight: 24, fontSize: 28, display: 'flex', alignItems: 'center' }} title="LinkedIn">
              <FaLinkedin style={{ transition: 'color 0.2s' }} className="hover:text-blue-200" />
            </a>
            <Button variant="contained" color='warning'>Sign in</Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default NavBar;
