import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Logo from '../Assets/images/Logo.png';
import { PAGES } from '../constants';

export const NavBar = () => {
  const handleCloseNavMenu = () => {};

  return (
    <AppBar position="static" sx={{backgroundColor : '#4d97ff'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
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
          <Box sx={{ flexGrow: 0, fontFamily:'monospace',display: { xs: 'none', md: 'flex' }}}>
            <Button variant="contained" color='warning'>Sign in</Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default NavBar;
