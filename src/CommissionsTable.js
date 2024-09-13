import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function calculateTotalPoints(affiliate, affiliates) {
    let totalPoints = affiliate.score;
    const visited = new Set();  // Set para rastrear afiliados visitados

    function addSubordinatesPoints(subordinateId) {
        if (visited.has(subordinateId)) return; // Se já visitado, não processa novamente
        visited.add(subordinateId);

        const subordinates = affiliates.filter(sub => sub.parentId === subordinateId);
        subordinates.forEach(sub => {
            totalPoints += sub.score;
            addSubordinatesPoints(sub.id);
        });
    }

    addSubordinatesPoints(affiliate.id);
    return totalPoints;
}

function calculateThreeLevelsPointsIncludingSelf(affiliate, affiliates) {
    let totalPoints = affiliate.score;

    function calculatePointsForLevel(currentAffiliate, level) {
        if (level > 3) return;
        const subordinates = affiliates.filter(sub => sub.parentId === currentAffiliate.id);
        subordinates.forEach(sub => {
            totalPoints += sub.score;
            calculatePointsForLevel(sub, level + 1);
        });
    }

    calculatePointsForLevel(affiliate, 1);
    return totalPoints;
}

function calculateCommission(affiliate, affiliates, exchangeRate) {
    let totalCommission = 0;
  
    const firstPurchaseRates = { 1: 0.25, 2: 0.12, 3: 0.05 };
    const subsequentPurchaseRates = { 1: 0.02, 2: 0.25, 3: 0.05 };

    const levelLimit = {
      "Associado": 2,
      "Construtor": 3,
      "Construtor Elite": 3,
    };
  
    const calculateCommissionForLevel = (subordinate, level) => {
      if (level > (levelLimit[affiliate.rank] || 0) || level > 3) return; // Checa nível máximo permitido
  
      const rate = subordinate.firstPurchaseMade ? firstPurchaseRates[level] : subsequentPurchaseRates[level];
      totalCommission += subordinate.score * rate;

      affiliates.filter(sub => sub.parentId === subordinate.id)
                .forEach(sub => calculateCommissionForLevel(sub, level + 1));
    };
  
    affiliates.filter(sub => sub.parentId === affiliate.id).forEach(sub => {
      calculateCommissionForLevel(sub, 1);
    });
  
    return totalCommission * exchangeRate;
}

function determineAffiliateLevel(affiliate, affiliates) {
    const directSubordinates = affiliates.filter(sub => sub.parentId === affiliate.id);
    const subordinatesPoints = directSubordinates.reduce((total, sub) => total + sub.score, 0);
    const threeLevelsPoints = calculateThreeLevelsPointsIncludingSelf(affiliate, affiliates);
    
    if (affiliate.score >= 50 && subordinatesPoints >= 50) {
        if (directSubordinates.length >= 3) {
            if (threeLevelsPoints >= 1000) {
                return 'Construtor Elite';
            }
            return 'Construtor';
        }
        return 'Associado';
    }
    
    return 'Não Qualificado';
}

function CommissionsTable({ affiliates, onRankChange }) {
    const exchangeRate = 4.00;

    return (
        <TableContainer component={Paper}>
            <Table aria-label="tabela de comissões">
                <TableHead>
                    <TableRow>
                        <TableCell>Nome do Afiliado</TableCell>
                        <TableCell align="right">Comissão (R$)</TableCell>
                        <TableCell align="right">Volume Total (LP)</TableCell>
                        <TableCell align="right">Volume 3 níveis (LP)</TableCell>
                        <TableCell align="right">Ranking</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {affiliates.map((affiliate) => {
                        const commission = calculateCommission(affiliate, affiliates, exchangeRate).toFixed(2);
                        const totalPoints = calculateTotalPoints(affiliate, affiliates);
                        const threeLevelsPointsIncludingSelf = calculateThreeLevelsPointsIncludingSelf(affiliate, affiliates);
                        let level = determineAffiliateLevel(affiliate, affiliates);
                        
                        return (
                            <TableRow key={affiliate.id}>
                                <TableCell>{affiliate.name}</TableCell>
                                <TableCell align="right">{`R$ ${commission}`}</TableCell>
                                <TableCell align="right">{totalPoints}</TableCell>
                                <TableCell align="right">{threeLevelsPointsIncludingSelf}</TableCell>
                                <TableCell align="right">{level}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CommissionsTable;
