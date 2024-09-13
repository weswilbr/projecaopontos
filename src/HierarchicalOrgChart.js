import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function HierarchicalOrgChart({ affiliates, resetOrganogram }) {
  const d3Container = useRef(null);
  const [shouldReset, setShouldReset] = useState(false);
  const [fontSize, setFontSize] = useState(10); // Estado para o tamanho da fonte

  useEffect(() => {
    if (resetOrganogram) {
      setShouldReset(true);
    }
  }, [resetOrganogram]);

  useEffect(() => {
    if (shouldReset && d3Container.current) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove();
      setShouldReset(false);
    }
  }, [shouldReset]);

  useEffect(() => {
    if (!shouldReset && affiliates.length && d3Container.current) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove();

      const svgWidth = 800; // Largura do SVG
      const svgHeight = 600; // Altura do SVG
      const margin = { top: 60, right: 50, bottom: 50, left: 250 }; // Mover mais para a direita
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      // Verifica se há IDs duplicados
      const ids = affiliates.map(affiliate => affiliate.id);
      const hasDuplicates = new Set(ids).size !== ids.length;
      if (hasDuplicates) {
        console.error("Error: Duplicate IDs found in affiliates data.");
        return;
      }

      const root = d3.stratify()
        .id(d => d.id)
        .parentId(d => d.parentId)(affiliates)
        .sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id));

      const treeLayout = d3.tree().nodeSize([100, 180]); // Mantém o espaçamento para evitar sobreposição
      treeLayout(root);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      const zoom = d3.zoom()
        .scaleExtent([0.1, 2])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom);

      const defs = svg.append("defs");
      const filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");
      filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode")
        .attr("in", "offsetBlur");
      feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left + 150},${margin.top})`); // Move mais para a direita com "+ 150"

      // Inicializa posições dos nós
      root.x0 = width / 2;
      root.y0 = 0;

      const update = (source) => {
        // Recalcula o layout da árvore após a expansão/recolhimento
        treeLayout(root);

        const nodes = root.descendants().reverse();
        const links = root.links();

        // Centralizar o organograma ajustando a posição dos nós
        nodes.forEach(d => {
          d.y = d.depth * 120; // Ajuste do espaçamento vertical para evitar sobreposição
        });

        // Selecione os nós
        const node = g.selectAll(".node")
          .data(nodes, d => d.id);

        // Entrando novos nós
        const nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", d => `translate(${source.x0},${source.y0})`)
          .on("click", click);

        // Adiciona hexágonos
        nodeEnter.append("polygon")
          .attr("points", d => {
            const nodeWidth = 40; // Diminuir o tamanho do nó
            const nodeHeight = Math.sqrt(3) * nodeWidth / 2;
            return [
              [0, -nodeWidth / 2],
              [nodeHeight / 2, -nodeWidth / 4],
              [nodeHeight / 2, nodeWidth / 4],
              [0, nodeWidth / 2],
              [-nodeHeight / 2, nodeWidth / 4],
              [-nodeHeight / 2, -nodeWidth / 4]
            ].join(" ");
          })
          .attr("fill", d => colorScale(d.depth)) // Mantém a cor baseada no nível (depth)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .style("filter", "url(#drop-shadow)");

        // Adiciona o texto dos nomes
        nodeEnter.append("text")
          .attr("x", 0) // Centraliza horizontalmente
          .attr("dy", "-3.5em") // Aumenta a distância do nome para o hexágono
          .attr("text-anchor", "middle")
          .text(d => d.data.name)
          .style("font-size", `${fontSize}px`) // Tamanho da fonte ajustável
          .style("fill", "#000")
          .style("font-weight", "bold");

        // Adiciona o texto do ID do afiliado
        nodeEnter.append("text")
          .attr("x", 0) // Centraliza horizontalmente
          .attr("dy", "-2.5em") // Aumenta a distância do ID para evitar sobreposição
          .attr("text-anchor", "middle")
          .text(d => `(${d.data.id})`) // Exibe o ID entre parênteses
          .style("font-size", `${fontSize}px`)
          .style("fill", "#000");

        // Adiciona o texto da pontuação
        nodeEnter.append("text")
          .attr("x", 0) // Centraliza horizontalmente
          .attr("dy", "2.3em") // Pontuação dentro do hexágono
          .attr("text-anchor", "middle")
          .text(d => d.data.score)
          .style("font-size", `${fontSize + 6}px`) // Tamanho da fonte ajustável
          .style("fill", "#000");

        // Atualização de posições dos nós
        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
          .duration(500)
          .attr("transform", d => `translate(${d.x},${d.y})`);

        // Remove nós que saem
        const nodeExit = node.exit().transition()
          .duration(500)
          .attr("transform", d => `translate(${source.x},${source.y})`)
          .remove();

        // Atualiza os links
        const link = g.selectAll(".link")
          .data(links, d => d.target.id);

        const linkEnter = link.enter().insert("path", "g")
          .attr("class", "link")
          .attr("d", d3.linkVertical()
            .x(d => source.x0)
            .y(d => source.y0)
          )
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5);

        const linkUpdate = linkEnter.merge(link);

        linkUpdate.transition()
          .duration(500)
          .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
          );

        link.exit().transition()
          .duration(500)
          .attr("d", d3.linkVertical()
            .x(d => source.x)
            .y(d => source.y)
          )
          .remove();

        // Guarda as posições antigas para a próxima transição
        nodes.forEach(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      };

      // Função de clique para recolher/expandir
      function click(event, d) {
        // Verifica se o nó está expandido (tem filhos)
        if (d.children) {
          d._children = d.children; // Armazena os filhos em _children
          d.children = null; // Recolhe o nó
        } else {
          d.children = d._children; // Restaura os filhos do estado armazenado em _children
          d._children = null;
        }
        update(d); // Atualiza a visualização após o clique
      }

      update(root); // Atualiza o gráfico inicial
    }
  }, [affiliates, resetOrganogram, shouldReset, fontSize]); // Adicionado fontSize como dependência

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setFontSize(prevSize => Math.max(prevSize - 2, 6))}>Diminuir Fonte</button>
        <button onClick={() => setFontSize(prevSize => prevSize + 2)}>Aumentar Fonte</button>
      </div>
      <svg ref={d3Container} width="100%" height="100%" viewBox={`0 0 800 600`} />
    </div>
  );
}

export default HierarchicalOrgChart;
