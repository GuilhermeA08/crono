/**
 * PDF Export Manager - Gerencia a exportação para PDF
 */
class PDFExportManager {
  exportToPDF(scheduleDays, people) {
    const { jsPDF } = window.jspdf;

    if (scheduleDays.length === 0) {
      throw new Error(
        "Não há dados para exportar. Adicione dias ao cronograma primeiro."
      );
    }

    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const columnWidth = (pageWidth - margin * 3) / 2;
    const columnGap = 10;

    let currentY = margin;
    let currentColumn = 0;

    // Configurações de cores por período
    const periodColors = {
      Manhã: [40, 167, 69],
      Tarde: [253, 126, 20],
      Noite: [111, 66, 193],
      "Dia todo": [0, 123, 255],
    };

    // Funções auxiliares
    const getColumnX = () =>
      currentColumn === 0 ? margin : margin + columnWidth + columnGap;

    const checkPageBreak = (neededSpace) => {
      if (currentY + neededSpace > pageHeight - 20) {
        if (currentColumn === 0) {
          currentColumn = 1;
          currentY = margin + 40;
        } else {
          doc.addPage();
          currentColumn = 0;
          currentY = margin;
          addHeader();
        }
      }
    };

    const addHeader = () => {
      doc.setFontSize(20);
      doc.setTextColor(0, 123, 255);
      doc.text("CRONOGRAMA DE ATIVIDADES", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 12;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 15;

      doc.setDrawColor(0, 123, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
    };

    // Adicionar cabeçalho inicial
    addHeader();

    // Ordenar dias
    const periodOrder = { Manhã: 1, Tarde: 2, Noite: 3, "Dia todo": 4 };
    const sortedDays = scheduleDays.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      return (periodOrder[a.period] || 5) - (periodOrder[b.period] || 5);
    });

    // Processar cada dia
    sortedDays.forEach((day, index) => {
      const peopleCount = day.allocatedPeople.length;
      const rolesCount = [...new Set(day.allocatedPeople.map((p) => p.role))]
        .length;
      const estimatedSpace = 25 + rolesCount * 8 + peopleCount * 5;

      checkPageBreak(estimatedSpace);

      // Formatar data
      const [year, month, dayNum] = day.date.split("-");
      const date = new Date(year, month - 1, dayNum);
      const dayName = date.toLocaleDateString("pt-BR", { weekday: "long" });
      const formattedDate = `${dayNum}/${month}/${year}`;
      const period = day.period || "Dia todo";

      const columnX = getColumnX();
      const periodColor = periodColors[period] || [0, 123, 255];

      // Cabeçalho do dia
      doc.setFillColor(periodColor[0], periodColor[1], periodColor[2]);
      doc.rect(columnX, currentY - 1, columnWidth, 12, "F");

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(
        `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`,
        columnX + 2,
        currentY + 6
      );

      doc.setFontSize(10);
      doc.text(`${formattedDate} - ${period}`, columnX + 2, currentY + 10);
      currentY += 15;

      // Pessoas alocadas
      if (day.allocatedPeople.length > 0) {
        const peopleByRole = {};
        day.allocatedPeople.forEach((person) => {
          if (!peopleByRole[person.role]) {
            peopleByRole[person.role] = [];
          }
          peopleByRole[person.role].push(person.name);
        });

        const sortedRoles = Object.keys(peopleByRole).sort();

        sortedRoles.forEach((role, roleIndex) => {
          checkPageBreak(15);

          const roleColor =
            roleIndex % 2 === 0 ? [248, 249, 250] : [233, 236, 239];

          doc.setFillColor(roleColor[0], roleColor[1], roleColor[2]);
          doc.rect(getColumnX(), currentY - 1, columnWidth, 6, "F");

          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${role}:`, getColumnX() + 2, currentY + 3);
          currentY += 7;

          const sortedPeople = peopleByRole[role].sort();
          sortedPeople.forEach((personName) => {
            checkPageBreak(5);

            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(`  - ${personName}`, getColumnX() + 5, currentY + 3);
            currentY += 5;
          });

          currentY += 2;
        });
      } else {
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text("Nenhuma pessoa escalada", getColumnX() + 2, currentY + 3);
        currentY += 8;
      }

      currentY += 8;

      if (index < sortedDays.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(getColumnX(), currentY, getColumnX() + columnWidth, currentY);
        currentY += 6;
      }
    });

    // Adicionar rodapés
    this.addFooters(doc, scheduleDays, people);

    // Salvar arquivo
    const today = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    doc.save(`cronograma-${today}.pdf`);
  }

  addFooters(doc, scheduleDays, people) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Fundo do rodapé
      doc.setFillColor(248, 249, 250);
      doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

      // Linha superior
      doc.setDrawColor(0, 123, 255);
      doc.setLineWidth(0.5);
      doc.line(0, pageHeight - 15, pageWidth, pageHeight - 15);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      // Número da página
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: "right" }
      );

      // Estatísticas
      doc.text(`Total de dias: ${scheduleDays.length}`, margin, pageHeight - 8);
      doc.text(`Total de pessoas: ${people.length}`, margin, pageHeight - 4);

      // Estatísticas por período
      const periodStats = {};
      scheduleDays.forEach((day) => {
        const period = day.period || "Dia todo";
        periodStats[period] = (periodStats[period] || 0) + 1;
      });

      let statsText = "Períodos: ";
      Object.keys(periodStats).forEach((period, index) => {
        if (index > 0) statsText += ", ";
        statsText += `${period}: ${periodStats[period]}`;
      });

      doc.text(statsText, pageWidth / 2, pageHeight - 4, { align: "center" });
    }
  }
}
