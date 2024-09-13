import React, { useState } from 'react';
import { Button, Modal, Typography, Box, List, ListItem, ListItemText, Divider, IconButton, TextField, Checkbox } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const products = [
  { id: '#2111190415', name: 'Fast Start Best Seller', points: 400, price: 3713.59 },
  { id: '#2111193430', name: 'Fast Start Core', points: 400, price: 3713.59 },
  { id: '#2111193503', name: 'Fast Start Pack Desafio', points: 400, price: 3509.28 },
  { id: '#2111124042', name: 'Transfer Factor Mastigável', points: 40, price: 327.27 },
  { id: '#2111124070', name: '4Life Transfer Factor® Tri-Factor®', points: 40, price: 303.96 },
  { id: '#2111124075', name: 'Transfer Factor Plus', points: 55, price: 391.42 },
  { id: '#2111124087', name: 'Glutamine Prime', points: 27, price: 254.55 },
  { id: '#2111124110', name: 'RioVida Burst', points: 27, price: 256.65 },
  { id: '#2111124113', name: 'RioVida Stix', points: 19, price: 199.19 },
  { id: '#2111125404', name: 'Transfer Factor Collagen', points: 23, price: 268.66 },
  { id: '#2111127563', name: 'Energy Go Stix Berry', points: 36, price: 294.80 },
  { id: '#2111127568', name: 'PRO-TF® Sabor Baunilha', points: 26, price: 467.77 },
  { id: '#2111128087', name: 'NutraStart® Chocolate', points: 25, price: 339.20 },
  { id: '#2111128095', name: '4Life BIOEFA', points: 17, price: 155.41 },
  { id: '#2111155777', name: 'Kit Builder', points: 150, price: 1229.09 },
  { id: '#2111193492', name: 'Power Pack', points: 255, price: 1963.64 }
];

const PurchaseButton = ({ onPurchase, affiliateId }) => {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleProductSelect = (product) => () => {
    const index = selectedProducts.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      const updatedProducts = [...selectedProducts];
      updatedProducts.splice(index, 1);
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([...selectedProducts, product]);
      setQuantities({ ...quantities, [product.id]: '' });
    }
  };

  const handleQuantityChange = (productId) => (event) => {
    const quantity = parseInt(event.target.value, 10) || 0;
    setQuantities({ ...quantities, [productId]: quantity });
  };

  const handlePurchase = () => {
    const items = selectedProducts.map((product) => ({
      product,
      quantity: parseInt(quantities[product.id], 10) || 1
    }));
    onPurchase(items, affiliateId);
    handleClose();
  };

  React.useEffect(() => {
    let points = 0;
    let price = 0;
    selectedProducts.forEach((product) => {
      const quantity = quantities[product.id] || 1;
      points += product.points * quantity;
      price += product.price * quantity;
    });
    setTotalPoints(points);
    setTotalPrice(price);
  }, [selectedProducts, quantities]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddShoppingCartIcon />}
        onClick={handleOpen}
      >
        Comprar
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            width: '95%',
            maxWidth: 600,
            bgcolor: '#fff',
            border: '2px solid #000',
            boxShadow: 24,
            p: 2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6"><b>Escolha os Produtos</b></Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Typography variant="subtitle1" gutterBottom><b>Total de Pontos:</b> <span style={{ color: 'red' }}>{totalPoints}</span></Typography>
          <Typography variant="subtitle1" gutterBottom><b>Total de Preço:</b> R$ <span style={{ color: 'blue' }}>{totalPrice.toFixed(2)}</span></Typography>
          <Divider />
          <TextField
            label="Buscar produto"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Divider />
          <List>
            {filteredProducts.map((product) => (
              <ListItem key={product.id} disablePadding alignItems="flex-start">
                <ListItemText
                  primary={<Typography variant="subtitle1">{product.name}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary"><b>Preço:</b> R$ {product.price} | <b>Pontos:</b> {product.points}</Typography>
                    </>
                  }
                />
                <Checkbox
                  checked={selectedProducts.some((p) => p.id === product.id)}
                  onChange={handleProductSelect(product)}
                />
                <TextField
                  label="Quantidade"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={quantities[product.id]}
                  onChange={handleQuantityChange(product.id)}
                  disabled={!selectedProducts.some((p) => p.id === product.id)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowForwardIcon />}
              onClick={handlePurchase}
            >
              Avançar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default PurchaseButton;
