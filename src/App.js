import React, { useState, useRef } from 'react';
import { Container, Typography, Button, Paper, Grid, useTheme } from '@mui/material';
import AffiliateItem from './AffiliateItem';
import CommissionsTable from './CommissionsTable';
import HierarchicalOrgChart from './HierarchicalOrgChart';
import TopMenu from './TopMenu';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import RankingProgress from './RankingProgress';

function App() {
  const [affiliates, setAffiliates] = useState([]);
  const [hasParentAffiliate, setHasParentAffiliate] = useState(false);
  const [resetOrganogram, setResetOrganogram] = useState(false);
  const [nextId, setNextId] = useState(0); // ID inicial
  const [availableIds, setAvailableIds] = useState([]); // Lista de IDs reutilizáveis
  const chartRef = useRef(null);
  const theme = useTheme();

  // Função para salvar o projeto
  const saveProject = () => {
    const projectData = {
      affiliates,
      hasParentAffiliate,
      nextId,
      availableIds
    };
    const dataStr = JSON.stringify(projectData);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para abrir um projeto
  const openProject = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        setAffiliates(data.affiliates || []);
        setHasParentAffiliate(data.hasParentAffiliate || false);
        setAvailableIds(data.availableIds || []);

        // Calcula o próximo ID com base nos IDs já existentes
        const maxExistingId = Math.max(...(data.affiliates || []).map(affiliate => parseInt(affiliate.id, 10)), 0);
        setNextId(maxExistingId + 1); // Configura o próximo ID como o maior ID existente + 1
        setResetOrganogram(true);
      };
      reader.readAsText(file);
    }
  };

  const getNextId = () => {
    if (availableIds.length > 0) {
      return availableIds.shift();
    }
    const newId = nextId;
    setNextId(prev => prev + 1);
    return newId;
  };

  const addAffiliate = () => {
    if (hasParentAffiliate) {
      alert("Um afiliado pai já foi adicionado. Não é possível adicionar outro.");
      return;
    }

    const nameInput = prompt("Nome do Afiliado:");
    if (nameInput === null) return;
    const name = nameInput.toUpperCase();

    if (!name || affiliates.some(affiliate => affiliate.name.toUpperCase() === name)) {
      alert("Entrada inválida ou afiliado já existe.");
      return;
    }

    const newAffiliate = {
      name,
      score: 0,
      id: getNextId().toString(),
      parentId: '',
      level: 0,
      firstPurchaseMade: false,
    };
    setAffiliates(prevAffiliates => [...prevAffiliates, newAffiliate]);
    setHasParentAffiliate(true);
  };

  const resetProject = () => {
    setAffiliates([]);
    setHasParentAffiliate(false);
    setResetOrganogram(true);
    setNextId(0);
    setAvailableIds([]);
  };

  const editAffiliate = (id, newName, newScore, firstPurchase, newId) => {
    if (affiliates.some(affiliate => affiliate.id === newId && affiliate.id !== id)) {
      alert("ID já existe. Escolha um ID único.");
      return;
    }

    setAffiliates(affiliates.map(affiliate =>
      affiliate.id === id ? { ...affiliate, name: newName, score: parseInt(newScore, 10), firstPurchaseMade: firstPurchase, id: newId } : affiliate
    ));
  };

  const deleteAffiliate = (id) => {
    setAffiliates(affiliates.filter(affiliate => affiliate.id !== id));
    setAvailableIds(prevIds => [...prevIds, parseInt(id)]);
  };

  const addSubordinate = (parentAffiliate) => {
    const nameInput = prompt("Nome do Novo Afiliado Direto:");
    if (nameInput === null) return;
    const name = nameInput.toUpperCase();

    if (!name || affiliates.some(affiliate => affiliate.name.toUpperCase() === name)) {
      alert("Entrada inválida ou afiliado já existe.");
      return;
    }

    const newSubordinate = {
      name,
      score: 0,
      id: getNextId().toString(),
      parentId: parentAffiliate.id,
      level: parentAffiliate.level + 1,
      firstPurchaseMade: false,
    };
    setAffiliates(prevAffiliates => [...prevAffiliates, newSubordinate]);
  };

  const exportPDF = () => {
    const chartNode = chartRef.current;
    if (!chartNode) return;

    html2canvas(chartNode).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save('organograma.pdf');
    });
  };

  // Função para validar a integridade da hierarquia
  const validateHierarchy = (affiliates) => {
    const ids = new Set(affiliates.map(a => a.id));
    for (const affiliate of affiliates) {
      if (affiliate.parentId && !ids.has(affiliate.parentId)) {
        return false;
      }
    }
    return true;
  };

  return (
    <>
      <TopMenu onAddAffiliate={addAffiliate} onExportPDF={exportPDF} onNewProject={resetProject} />
      <Container maxWidth="lg" sx={{ marginTop: '20px', backgroundColor: theme.palette.background.default, minHeight: '100vh', color: theme.palette.text.primary }}>
        <Typography variant="h4" align="center" gutterBottom>
          Projeção de Ganhos - 4Life
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" color="warning" onClick={resetProject} sx={{ mb: 2 }}>
              Novo Projeto
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={addAffiliate} disabled={hasParentAffiliate} sx={{ mb: 2 }}>
              Inserir Afiliado
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={exportPDF} sx={{ mb: 2 }}>
              Exportar para PDF
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={saveProject} sx={{ mb: 2 }}>
              Salvar Projeto
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Abrir Projeto
              <input type="file" hidden onChange={openProject} />
            </Button>
          </Grid>
        </Grid>
        {/* Passando a lista de afiliados para o RankingProgress */}
        <RankingProgress affiliates={affiliates} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 1, minHeight: '500px', overflowY: 'auto' }}>
              {affiliates.map(affiliate => (
                <AffiliateItem
                  key={affiliate.id}
                  affiliate={affiliate}
                  onEdit={editAffiliate}
                  onDelete={deleteAffiliate}
                  onAddSubordinate={addSubordinate}
                />
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 1 }}>
              <CommissionsTable affiliates={affiliates} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 1 }}>
              <div ref={chartRef}>
                {/* Valida a hierarquia antes de renderizar a árvore */}
                {validateHierarchy(affiliates) ? (
                  <HierarchicalOrgChart affiliates={affiliates} resetOrganogram={resetOrganogram} />
                ) : (
                  <Typography color="error" align="center">Erro: A hierarquia de afiliados está malformada.</Typography>
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
