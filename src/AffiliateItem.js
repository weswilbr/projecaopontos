import React, { useState } from 'react';
import {
  Card, CardActions, CardContent, Typography, IconButton, Box, Button, Snackbar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, Grid,
  Checkbox, FormControlLabel, TextField, List, ListItem, ListItemText,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PurchaseButton from './PurchaseButton';

const AffiliateItem = ({ affiliate, onEdit, onDelete, onAddSubordinate, affiliates, products }) => {
  const theme = useTheme(); // Usa o tema para acessar cores e estilos
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(affiliate.name);
  const [editedScore, setEditedScore] = useState(affiliate.score.toString());
  const [editedId, setEditedId] = useState(affiliate.id.toString()); // Novo estado para o ID, inicializando como string
  const [isFirstPurchase, setIsFirstPurchase] = useState(affiliate.firstPurchaseMade);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [insertedProducts, setInsertedProducts] = useState([]);

  const handleFirstPurchaseChange = () => {
    const newIsFirstPurchase = !isFirstPurchase;
    setIsFirstPurchase(newIsFirstPurchase);
    onEdit(affiliate.id, editedName, parseInt(editedScore, 10), newIsFirstPurchase, editedId);
  };

  const validateAndSave = () => {
    if (editedName.trim() === '' || isNaN(editedScore) || parseInt(editedScore, 10) < 0 || editedId.trim() === '') {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    // Verifica se 'affiliates' está definido e se o novo ID já está em uso por outro afiliado
    if (editedId !== affiliate.id && affiliates && affiliates.some(existingAffiliate => existingAffiliate.id === editedId)) {
      alert("O ID já está em uso. Escolha um ID diferente.");
      return;
    }

    onEdit(affiliate.id, editedName.trim().toUpperCase(), parseInt(editedScore, 10), isFirstPurchase, editedId.trim());
    setIsEditing(false);
    setSnackbarOpen(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(affiliate.name);
    setEditedScore(affiliate.score.toString());
    setEditedId(affiliate.id.toString()); // Restaura o ID original como string
    setIsFirstPurchase(affiliate.firstPurchaseMade);
    setIsEditing(false);
  };

  const handlePurchase = (selectedProducts, affiliateId) => {
    const totalPoints = selectedProducts.reduce((acc, curr) => acc + curr.product.points * curr.quantity, 0);
    if (!isNaN(totalPoints)) {
      const newScore = affiliate.score + totalPoints;
      onEdit(affiliate.id, affiliate.name, newScore, isFirstPurchase, editedId);
      setSnackbarOpen(true);
      setInsertedProducts([...insertedProducts, ...selectedProducts.map(item => ({ productName: item.product.name, quantity: item.quantity }))]);
    } else {
      console.error("Erro ao calcular a pontuação total dos produtos selecionados.");
    }
  };

  const handleRemoveProduct = (indexToRemove) => {
    setInsertedProducts(insertedProducts.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Card variant="outlined" sx={{ marginBottom: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ flexGrow: 1, mr: 1 }}>
            {`${affiliate.name} - Pontuação: ${affiliate.score} - Nível: ${affiliate.level || 0}`}
          </Typography>
          <Tooltip title={isFirstPurchase ? "Desmarcar primeira compra" : "Marcar como primeira compra"}>
            <IconButton onClick={handleFirstPurchaseChange} color={isFirstPurchase ? "primary" : "default"}>
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
          {affiliate.score >= 50 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {`ID: ${affiliate.id || '0'}`} {/* Exibe o ID do afiliado, padrão é '0' */}
        </Typography>
        {isEditing && (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Afiliado"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Pontuação"
                value={editedScore}
                onChange={(e) => setEditedScore(e.target.value)}
                type="number"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox checked={isFirstPurchase} onChange={(e) => setIsFirstPurchase(e.target.checked)} />}
                label="Primeira Compra"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID do Afiliado"
                value={editedId} // Campo de entrada de ID
                onChange={(e) => setEditedId(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Box display="flex">
          {isEditing ? (
            <>
              <Button onClick={validateAndSave} color="primary" variant="contained" sx={{ mr: 1 }}>Salvar</Button>
              <Button onClick={handleCancel} color="secondary" variant="outlined">Cancelar</Button>
            </>
          ) : (
            <>
              <Tooltip title="Editar">
                <IconButton onClick={handleEdit} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
              {affiliate.level > 0 && (
                <Tooltip title="Excluir">
                  <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Adicionar Afiliado Direto">
                <IconButton onClick={() => onAddSubordinate(affiliate)} color="secondary">
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
        <PurchaseButton onPurchase={handlePurchase} affiliateId={affiliate.id} products={products} />
      </CardActions>
      <CardContent>
        <Typography variant="subtitle1">Histórico de Produtos Inseridos:</Typography>
        <List>
          {insertedProducts.map((item, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${item.productName} - Quantidade: ${item.quantity}`} />
              <IconButton onClick={() => handleRemoveProduct(index)} color="secondary">
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message="Alterações salvas!" />
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza de que deseja excluir este afiliado? Esta ação é irreversível.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancelar</Button>
          <Button onClick={() => { onDelete(affiliate.id); setDeleteDialogOpen(false); }} color="secondary" autoFocus>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AffiliateItem;
