/**
 * Schedule Manager - Controlador principal da aplicação
 */
class ScheduleManager {
  constructor() {
    this.dataManager = new DataManager();
    this.uiManager = new UIManager(this.dataManager);
    this.pdfExporter = new PDFExportManager();

    // Carregar dados
    const data = this.dataManager.loadData();
    this.people = data.people;
    this.scheduleDays = data.scheduleDays;
    this.roles = data.roles;
    this.roleColors = data.roleColors;

    this.current = {}; // Para armazenar estado temporário

    this.initializeEventListeners();
  }

  // Salvar dados
  save() {
    this.dataManager.saveData({
      people: this.people,
      scheduleDays: this.scheduleDays,
      roles: this.roles,
      roleColors: this.roleColors,
    });
  }

  // Renderizar toda a interface
  renderAll() {
    this.uiManager.createDynamicRoleStyles(this.roles, this.roleColors);
    this.uiManager.renderPeople(
      this.people,
      this.scheduleDays,
      (id) => this.editPerson(id),
      (id) => this.deletePerson(id)
    );
    this.uiManager.renderRoles(this.roles, this.roleColors, (role, index) =>
      this.deleteRole(role, index)
    );
    this.uiManager.renderDays(
      this.scheduleDays,
      this.people,
      this.roles,
      (id) => this.removeDay(id),
      (id) => this.editDay(id),
      (id) => this.addPersonToDay(id),
      (personId, day) => this.removePersonFromDay(personId, day),
      (personId, date) => this.editAllocation(personId, date),
      (dragData, day) => this.handleDrop(dragData, day)
    );
  }

  // Gerenciamento de pessoas
  addPerson(name) {
    if (!name.trim()) {
      this.uiManager.showAlert("Digite um nome");
      return;
    }

    // Verificar se já existe
    if (this.people.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
      this.uiManager.showAlert("Já existe uma pessoa com esse nome");
      return;
    }

    this.people.push({
      id: crypto.randomUUID(),
      name: name.trim(),
    });
    this.save();
    this.renderAll();
  }

  deletePerson(id) {
    this.people = this.people.filter((p) => p.id !== id);
    // Remover das alocações
    this.scheduleDays.forEach((day) => {
      day.allocatedPeople = day.allocatedPeople.filter((p) => p.id !== id);
    });
    this.save();
    this.renderAll();
  }

  editPerson(id) {
    this.current.personId = id;
    const person = this.people.find((p) => p.id === id);
    document.getElementById("editPersonName").value = person.name;
    new bootstrap.Modal(document.getElementById("editPersonModal")).show();
  }

  savePersonEdit() {
    const newName = document.getElementById("editPersonName").value.trim();

    if (!newName) {
      this.uiManager.showAlert("Digite um nome");
      return;
    }

    // Verificar duplicatas
    const existingPerson = this.people.find(
      (p) =>
        p.id !== this.current.personId &&
        p.name.toLowerCase() === newName.toLowerCase()
    );

    if (existingPerson) {
      this.uiManager.showAlert("Já existe uma pessoa com esse nome");
      return;
    }

    const person = this.people.find((p) => p.id === this.current.personId);
    person.name = newName;

    // Atualizar alocações
    this.scheduleDays.forEach((day) => {
      day.allocatedPeople.forEach((allocatedPerson) => {
        if (allocatedPerson.id === this.current.personId) {
          allocatedPerson.name = newName;
        }
      });
    });

    this.save();
    this.renderAll();
    bootstrap.Modal.getInstance(
      document.getElementById("editPersonModal")
    ).hide();
  }

  // Gerenciamento de funções
  addRole(name) {
    if (!name.trim()) {
      this.uiManager.showAlert("Digite o nome da função");
      return;
    }

    if (this.roles.includes(name.trim())) {
      this.uiManager.showAlert("Função já existe");
      return;
    }

    const newRole = name.trim();
    this.roles.push(newRole);
    this.dataManager.getColorForRole(newRole, this.roles, this.roleColors);
    this.save();
    this.renderAll();
  }

  deleteRole(role, index) {
    if (this.roles.length <= 1) return;

    delete this.roleColors[role];
    this.roles.splice(index, 1);

    // Atualizar alocações
    this.scheduleDays.forEach((day) => {
      day.allocatedPeople.forEach((person) => {
        if (person.role === role) {
          person.role = this.roles[0];
        }
      });
    });

    this.save();
    this.renderAll();
  }

  // Gerenciamento de dias
  addDay(date, period) {
    if (!date) {
      this.uiManager.showAlert("Selecione uma data no calendário");
      return;
    }

    // Verificar duplicatas
    const existingDay = this.scheduleDays.find(
      (d) => d.date === date && d.period === period
    );

    if (existingDay) {
      this.uiManager.showAlert(
        `Já existe um cronograma para ${period.toLowerCase()} nesta data`
      );
      return;
    }

    this.scheduleDays.push({
      id: crypto.randomUUID(),
      date: date,
      period: period,
      allocatedPeople: [],
    });

    this.save();
    this.renderAll();
  }

  removeDay(id) {
    this.scheduleDays = this.scheduleDays.filter((d) => d.id !== id);
    this.save();
    this.renderAll();
  }

  editDay(id) {
    this.current.dayId = id;
    const day = this.scheduleDays.find((d) => d.id === id);
    document.getElementById("editDayDate").value = day.date;
    document.getElementById("editDayPeriod").value = day.period || "Dia todo";
    new bootstrap.Modal(document.getElementById("editDayModal")).show();
  }

  saveDayEdit() {
    const newDate = document.getElementById("editDayDate").value;
    const newPeriod = document.getElementById("editDayPeriod").value;

    if (!newDate) {
      this.uiManager.showAlert("Selecione uma data");
      return;
    }

    // Verificar duplicatas
    const existingDay = this.scheduleDays.find(
      (d) =>
        d.id !== this.current.dayId &&
        d.date === newDate &&
        d.period === newPeriod
    );

    if (existingDay) {
      this.uiManager.showAlert(
        `Já existe um cronograma para ${newPeriod.toLowerCase()} nesta data`
      );
      return;
    }

    const day = this.scheduleDays.find((d) => d.id === this.current.dayId);
    day.date = newDate;
    day.period = newPeriod;

    this.save();
    this.renderAll();
    bootstrap.Modal.getInstance(document.getElementById("editDayModal")).hide();
  }

  // Gerenciamento de alocações
  addPersonToDay(dayId) {
    this.current.dayId = dayId;
    const day = this.scheduleDays.find((d) => d.id === dayId);

    const hasAvailablePeople = this.uiManager.fillAddPersonModal(
      day,
      this.people,
      this.roles
    );

    if (!hasAvailablePeople) {
      this.uiManager.showAlert(
        "Todas as pessoas já estão alocadas neste dia ou não há pessoas cadastradas."
      );
      return;
    }

    new bootstrap.Modal(document.getElementById("addPersonToDayModal")).show();
  }

  savePersonToDay() {
    const personName = document
      .getElementById("selectPersonToAdd")
      .value.trim();
    const roleSelected = document.getElementById("selectRoleForPerson").value;

    if (!personName) {
      this.uiManager.showAlert("Digite ou selecione uma pessoa");
      return;
    }

    if (!roleSelected) {
      this.uiManager.showAlert("Selecione uma função");
      return;
    }

    const person = this.people.find(
      (p) => p.name.toLowerCase() === personName.toLowerCase()
    );

    if (!person) {
      this.uiManager.showAlert(
        "Pessoa não encontrada. Verifique o nome digitado."
      );
      return;
    }

    const day = this.scheduleDays.find((d) => d.id === this.current.dayId);

    if (day.allocatedPeople.find((ap) => ap.id === person.id)) {
      this.uiManager.showAlert("Esta pessoa já está alocada neste dia");
      return;
    }

    day.allocatedPeople.push({
      id: person.id,
      name: person.name,
      role: roleSelected,
    });

    this.save();
    this.renderAll();
    bootstrap.Modal.getInstance(
      document.getElementById("addPersonToDayModal")
    ).hide();
  }

  removePersonFromDay(personId, day) {
    day.allocatedPeople = day.allocatedPeople.filter((p) => p.id !== personId);
    this.save();
    this.renderAll();
  }

  editAllocation(personId, date) {
    const day = this.scheduleDays.find((d) => d.date === date);
    const allocation = day.allocatedPeople.find((p) => p.id === personId);

    this.current = { date, pid: personId };

    this.uiManager.fillEditAllocationModal(allocation, day, this.roles);
    new bootstrap.Modal(document.getElementById("editAllocationModal")).show();
  }

  saveAllocationEdit() {
    const newRole = document.getElementById("editAllocRole").value;
    const day = this.scheduleDays.find((d) => d.date === this.current.date);
    const allocation = day.allocatedPeople.find(
      (p) => p.id === this.current.pid
    );

    allocation.role = newRole;
    this.save();
    this.renderAll();
    bootstrap.Modal.getInstance(
      document.getElementById("editAllocationModal")
    ).hide();
  }

  // Drag and Drop
  handleDrop(dragData, targetDay) {
    if (dragData.startsWith("allocated:")) {
      this.handleMoveAllocation(dragData, targetDay);
    } else {
      this.handleNewAllocation(dragData, targetDay);
    }
  }

  handleMoveAllocation(dragData, targetDay) {
    const [, personId, sourceDate, sourcePeriod] = dragData.split(":");

    // Não permitir mover para o mesmo dia
    if (
      sourceDate === targetDay.date &&
      sourcePeriod === (targetDay.period || "Dia todo")
    ) {
      return;
    }

    // Verificar se já está no dia de destino
    if (targetDay.allocatedPeople.find((p) => p.id === personId)) {
      return;
    }

    // Encontrar dia de origem
    const sourceDay = this.scheduleDays.find(
      (d) => d.date === sourceDate && (d.period || "Dia todo") === sourcePeriod
    );

    const personToMove = sourceDay.allocatedPeople.find(
      (p) => p.id === personId
    );

    // Remover da origem
    sourceDay.allocatedPeople = sourceDay.allocatedPeople.filter(
      (p) => p.id !== personId
    );

    // Adicionar ao destino
    targetDay.allocatedPeople.push({
      id: personToMove.id,
      name: personToMove.name,
      role: personToMove.role,
    });

    this.save();
    this.renderAll();
  }

  handleNewAllocation(personId, targetDay) {
    if (targetDay.allocatedPeople.find((p) => p.id === personId)) {
      return;
    }

    const person = this.people.find((p) => p.id === personId);
    targetDay.allocatedPeople.push({
      id: person.id,
      name: person.name,
      role: this.roles[0] || "Sem função",
    });

    this.save();
    this.renderAll();
  }

  // Exportação
  exportToPDF() {
    const btn = document.getElementById("exportPdfBtn");
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
    btn.disabled = true;

    try {
      this.pdfExporter.exportToPDF(this.scheduleDays, this.people);
    } catch (error) {
      this.uiManager.showAlert(error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  // Limpar dados seletivamente
  clearSelectedData() {
    const clearPeople = document.getElementById("clearPeople").checked;
    const clearDays = document.getElementById("clearDays").checked;
    const clearRoles = document.getElementById("clearRoles").checked;
    const clearAllocations =
      document.getElementById("clearAllocations").checked;

    // Verificar se pelo menos uma opção foi selecionada
    if (!clearPeople && !clearDays && !clearRoles && !clearAllocations) {
      this.uiManager.showAlert("Selecione pelo menos uma opção para limpar.");
      return;
    }

    let deletedItems = [];

    // Limpar apenas alocações (sem remover pessoas ou dias)
    if (clearAllocations && !clearPeople && !clearDays) {
      this.scheduleDays.forEach((day) => {
        day.allocatedPeople = [];
      });
      deletedItems.push("alocações");
    } else {
      // Limpar pessoas
      if (clearPeople) {
        this.people = [];
        // Remover pessoas das alocações também
        this.scheduleDays.forEach((day) => {
          day.allocatedPeople = [];
        });
        deletedItems.push("pessoas");
      }

      // Limpar dias
      if (clearDays) {
        this.scheduleDays = [];
        deletedItems.push("dias do cronograma");
      }

      // Limpar funções (mantendo as padrão)
      if (clearRoles) {
        this.roles = ["Transmissão", "Fotos"];
        this.roleColors = { Transmissão: "#28a745", Fotos: "#fd7e14" };

        // Atualizar funções das pessoas alocadas para as padrão
        this.scheduleDays.forEach((day) => {
          day.allocatedPeople.forEach((person) => {
            if (!this.roles.includes(person.role)) {
              person.role = this.roles[0];
            }
          });
        });
        deletedItems.push("funções personalizadas");
      }
    }

    this.save();
    this.renderAll();

    const message =
      deletedItems.length > 0
        ? `${deletedItems.join(", ")} removido(s) com sucesso!`
        : "Nenhum dado foi removido.";

    this.uiManager.showAlert(message);
  }

  // Configurar modal de limpeza
  setupClearModal() {
    // Resetar checkboxes para o estado padrão
    document.getElementById("clearPeople").checked = true;
    document.getElementById("clearDays").checked = true;
    document.getElementById("clearRoles").checked = true;
    document.getElementById("clearAllocations").checked = false;
  }

  // Event Listeners
  initializeEventListeners() {
    // Adicionar pessoa
    document.getElementById("addPersonBtn").onclick = () => {
      const input = document.getElementById("personNameInput");
      this.addPerson(input.value);
      input.value = "";
    };

    // Adicionar função
    document.getElementById("addRoleBtn").onclick = () => {
      const input = document.getElementById("roleNameInput");
      this.addRole(input.value);
      input.value = "";
    };

    // Adicionar dia
    document.getElementById("addDayBtn").onclick = () => {
      const dateInput = document.getElementById("calendarInput");
      const periodSelect = document.getElementById("periodSelect");

      this.addDay(dateInput.value, periodSelect.value);

      dateInput.value = "";
      periodSelect.value = "Manhã";
    };

    // Salvar edições
    document.getElementById("saveAllocBtn").onclick = () =>
      this.saveAllocationEdit();
    document.getElementById("saveDayBtn").onclick = () => this.saveDayEdit();
    document.getElementById("savePersonBtn").onclick = () =>
      this.savePersonEdit();
    document.getElementById("addPersonToDayBtn").onclick = () =>
      this.savePersonToDay();

    // Exportação e limpeza
    document.getElementById("exportPdfBtn").onclick = () => this.exportToPDF();
    document.getElementById("clearAllBtn").onclick = () => {
      this.setupClearModal();
      new bootstrap.Modal(document.getElementById("confirmClearModal")).show();
    };
    document.getElementById("confirmClearBtn").onclick = () => {
      this.clearSelectedData();
      bootstrap.Modal.getInstance(
        document.getElementById("confirmClearModal")
      ).hide();
    };

    // Controles do modal de limpeza
    document.getElementById("selectAllBtn").onclick = () => {
      document.getElementById("clearPeople").checked = true;
      document.getElementById("clearDays").checked = true;
      document.getElementById("clearRoles").checked = true;
      document.getElementById("clearAllocations").checked = false;
    };

    document.getElementById("selectNoneBtn").onclick = () => {
      document.getElementById("clearPeople").checked = false;
      document.getElementById("clearDays").checked = false;
      document.getElementById("clearRoles").checked = false;
      document.getElementById("clearAllocations").checked = false;
    };

    // Lógica para exclusão mútua entre "clearAllocations" e outros
    document
      .getElementById("clearAllocations")
      .addEventListener("change", (e) => {
        if (e.target.checked) {
          document.getElementById("clearPeople").checked = false;
          document.getElementById("clearDays").checked = false;
          document.getElementById("clearRoles").checked = false;
        }
      });

    ["clearPeople", "clearDays", "clearRoles"].forEach((id) => {
      document.getElementById(id).addEventListener("change", (e) => {
        if (e.target.checked) {
          document.getElementById("clearAllocations").checked = false;
        }
      });
    });

    // Enter para adicionar
    document
      .getElementById("personNameInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          document.getElementById("addPersonBtn").click();
        }
      });

    document
      .getElementById("roleNameInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          document.getElementById("addRoleBtn").click();
        }
      });
  }
}
