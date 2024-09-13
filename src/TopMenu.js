import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import LanguageIcon from '@mui/icons-material/Language';

function TopMenu({ onAddAffiliate, onExportPDF, onNewProject }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNewProject = () => {
    handleMenuClose();
    if (onNewProject) {
      onNewProject(); // Chama a função para iniciar um novo projeto
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Afiliados
        </Typography>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleNewProject}>Novo Projeto</MenuItem>
          <MenuItem onClick={onAddAffiliate}>Inserir Afiliado</MenuItem>
          <MenuItem onClick={onExportPDF}>Exportar</MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <InfoIcon /> Sobre
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <FeedbackIcon /> Enviar Feedback
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <HelpIcon /> Ajuda
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <LanguageIcon /> Idioma
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default TopMenu;
