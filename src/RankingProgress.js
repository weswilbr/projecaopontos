import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, Tooltip, IconButton, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { grey, yellow } from '@mui/material/colors';

const rankings = [
  { name: "Não Qualificado", requisitos: "Sem requisitos." },
  { name: "Associado", requisitos: "Mínimo 50 LP pessoal." },
  { name: "Construtor", requisitos: "Mínimo 100 LP pessoal e 3 afiliados diretos." },
  { name: "Construtor Elite", requisitos: "Mínimo 200 LP pessoal e 6 afiliados diretos." },
  { name: "Diamante", requisitos: "Mínimo 300 LP pessoal e volume de 1000 LP na rede." },
  { name: "Diamante Elite", requisitos: "Mínimo 500 LP pessoal e volume de 2500 LP na rede." },
  { name: "Presidencial", requisitos: "Mínimo 700 LP pessoal e volume de 5000 LP na rede." },
  { name: "Elite Presidencial", requisitos: "Mínimo 1000 LP pessoal e volume de 10.000 LP na rede." },
  { name: "Bronze", requisitos: "Mínimo 2000 LP pessoal e volume de 20.000 LP na rede." },
  { name: "Bronze Elite", requisitos: "Mínimo 3000 LP pessoal e volume de 30.000 LP na rede." },
  { name: "Prata", requisitos: "Mínimo 4000 LP pessoal e volume de 40.000 LP na rede." },
  { name: "Prata Elite", requisitos: "Mínimo 5000 LP pessoal e volume de 50.000 LP na rede." },
  { name: "Ouro", requisitos: "Mínimo 7000 LP pessoal e volume de 70.000 LP na rede." },
  { name: "Ouro Elite", requisitos: "Mínimo 10.000 LP pessoal e volume de 100.000 LP na rede." },
  { name: "Platina", requisitos: "Mínimo 15.000 LP pessoal e volume de 150.000 LP na rede." },
  { name: "Platina Elite", requisitos: "Mínimo 20.000 LP pessoal e volume de 200.000 LP na rede." }
];

function RankingProgress({ affiliates, onRankChange }) {
  const [selectedRankIndex, setSelectedRankIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Encontrar o afiliado de nível 0 e o índice atual do ranking
  const levelZeroAffiliate = affiliates.find(affiliate => affiliate.level === 0) || {};
  const currentRankIndex = rankings.findIndex(rank => rank.name === (levelZeroAffiliate.rank || "Não Qualificado"));

  // Atualizar o progresso dinamicamente com base no índice atual
  const progress = (selectedRankIndex / (rankings.length - 1)) * 100;

  useEffect(() => {
    // Sempre que o afiliado de nível 0 ou seu rank mudar, atualize o selectedRankIndex
    setSelectedRankIndex(currentRankIndex);
  }, [levelZeroAffiliate, currentRankIndex]);

  const handleRankChange = (rank, index) => {
    if (index <= currentRankIndex) {
      setSelectedRankIndex(index);
      if (onRankChange) {
        onRankChange(rank);
      }
    }
  };

  const moveToNextRank = () => {
    if (selectedRankIndex < rankings.length - 1) {
      const nextRank = rankings[selectedRankIndex + 1].name;
      setSelectedRankIndex(selectedRankIndex + 1);
      if (onRankChange) {
        onRankChange(nextRank);
      }
    }
  };

  const moveToPreviousRank = () => {
    if (selectedRankIndex > 0) {
      const prevRank = rankings[selectedRankIndex - 1].name;
      setSelectedRankIndex(selectedRankIndex - 1);
      if (onRankChange) {
        onRankChange(prevRank);
      }
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%', mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Progresso de Ranking: {rankings[selectedRankIndex].name}
      </Typography>
      <Box sx={{ position: 'relative', mt: 2 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1
          }}
        >
          {rankings.map((rank, index) => (
            <Tooltip key={index} title={`Rank: ${rank.name}`} arrow>
              <span>
                <IconButton
                  aria-label={`Rank ${rank.name}`}
                  onClick={() => handleRankChange(rank.name, index)}
                  disabled={index > currentRankIndex}
                  sx={{ color: index <= selectedRankIndex && index > 0 ? yellow[700] : grey[500] }}
                >
                  {index <= selectedRankIndex && index > 0 ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Box>
      </Box>
      <Divider sx={{ mt: 2 }} />
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
        {`Progresso: ${progress.toFixed(2)}%`}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={moveToPreviousRank}
          disabled={selectedRankIndex <= 0}
        >
          Voltar para Rank Anterior
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={moveToNextRank}
          disabled={selectedRankIndex >= rankings.length - 1}
        >
          Avançar para Próximo Rank
        </Button>
      </Box>
      <Button
        variant="outlined"
        color="info"
        sx={{ mt: 2 }}
        onClick={handleDialogOpen}
      >
        Requisitos para {rankings[selectedRankIndex].name}
      </Button>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Requisitos para {rankings[selectedRankIndex].name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {rankings[selectedRankIndex].requisitos}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

RankingProgress.propTypes = {
  affiliates: PropTypes.arrayOf(PropTypes.shape({
    level: PropTypes.number.isRequired,
    rank: PropTypes.string.isRequired
  })).isRequired,
  onRankChange: PropTypes.func
};

export default RankingProgress;
