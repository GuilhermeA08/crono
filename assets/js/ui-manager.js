/**
 * UI Manager - Gerencia a interface do usuário e renderização
 */
class UIManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  // Exibir alerta para o usuário
  showAlert(message) {
    document.getElementById("alertBody").textContent = message;
    new bootstrap.Modal(document.getElementById("alertModal")).show();
  }

  // Criar estilos dinâmicos para as funções
  createDynamicRoleStyles(roles, roleColors) {
    // Remove estilos antigos
    const existingStyle = document.getElementById("dynamic-role-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Cria novos estilos
    const style = document.createElement("style");
    style.id = "dynamic-role-styles";
    let css = "";

    roles.forEach((role) => {
      const color = this.dataManager.getColorForRole(role, roles, roleColors);
      const className = role.toLowerCase().replace(/[^a-z]/g, "");
      const textColor = this.dataManager.isLightColor(color)
        ? "#212529"
        : "#fff";
      css += `.role-${className} { background: ${color}; color: ${textColor}; }\n`;
    });

    style.textContent = css;
    document.head.appendChild(style);
  }

  // Renderizar lista de pessoas
  renderPeople(people, scheduleDays, onEdit, onDelete) {
    const ul = document.getElementById("peopleList");
    ul.innerHTML = "";

    // Ordenar pessoas alfabeticamente
    const sortedPeople = [...people].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    sortedPeople.forEach((person) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between";
      li.draggable = true;
      li.dataset.id = person.id;
      li.innerHTML = `
        <span>${person.name}</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-info edit-person-btn" data-id="${person.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-person-btn">&times;</button>
        </div>`;

      // Event listeners
      li.querySelector(".delete-person-btn").onclick = () =>
        onDelete(person.id);
      li.querySelector(".edit-person-btn").onclick = () => onEdit(person.id);

      // Drag functionality
      li.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", person.id);
      });

      ul.appendChild(li);
    });
  }

  // Renderizar lista de funções
  renderRoles(roles, roleColors, onDelete) {
    const ul = document.getElementById("rolesList");
    ul.innerHTML = "";

    // Ordenar funções alfabeticamente
    const sortedRoles = [...roles].sort((a, b) => a.localeCompare(b));

    sortedRoles.forEach((role) => {
      const index = roles.indexOf(role);
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";

      const color = this.dataManager.getColorForRole(role, roles, roleColors);

      li.innerHTML = `
        <div class="d-flex align-items-center">
          <div style="width: 20px; height: 20px; background: ${color}; border-radius: 50%; margin-right: 10px;"></div>
          <span>${role}</span>
        </div>
        <button class="btn btn-sm btn-danger" ${
          roles.length <= 1 ? "disabled" : ""
        }>&times;</button>`;

      // Event listener para delete
      li.querySelector("button").onclick = () => {
        if (roles.length > 1) {
          onDelete(role, index);
        }
      };

      ul.appendChild(li);
    });
  }

  // Formatar data para exibição
  formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  // Obter o dia da semana
  getDayOfWeek(dateString) {
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(year, month - 1, day);
    const daysOfWeek = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return daysOfWeek[dateObj.getDay()];
  }

  // Renderizar dias do cronograma
  renderDays(
    scheduleDays,
    people,
    roles,
    onRemoveDay,
    onEditDay,
    onAddPersonToDay,
    onRemovePersonFromDay,
    onEditAllocation,
    onDrop
  ) {
    const cont = document.getElementById("scheduleDaysContainer");
    cont.innerHTML = "";

    // Ordenar os dias por data e período
    const periodOrder = { Manhã: 1, Tarde: 2, Noite: 3, "Dia todo": 4 };
    const sortedDays = scheduleDays.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      return (periodOrder[a.period] || 5) - (periodOrder[b.period] || 5);
    });

    sortedDays.forEach((day) => {
      const col = document.createElement("div");
      col.className = "col-md-3 mb-4";

      const displayDate = this.formatDate(day.date);
      const dayOfWeek = this.getDayOfWeek(day.date);
      const periodClass = `period-${(day.period || "Dia todo")
        .toLowerCase()
        .replace(/\s+/g, "")}`;

      col.innerHTML = `
        <div class="card ${periodClass}">
          <div class="card-header d-flex justify-content-between">
            <div>
              <div style="font-weight: bold;">${dayOfWeek}</div>
              <div style="font-size: 0.9em;">${displayDate}</div>
              <div style="font-size: 0.8em; opacity: 0.9;">${
                day.period || "Dia todo"
              }</div>
            </div>
            <div class="d-flex gap-1">
              <button class="edit-day-btn" style="background:rgba(255,255,255,0.2); border:none; color:#fff; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; transition:all 0.2s;" title="Editar dia">
                <i class="fas fa-edit"></i>
              </button>
              <button class="remove-day-btn">&times;</button>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="text-muted">Arraste pessoas ou</small>
              <button class="btn btn-sm btn-outline-primary add-person-to-day-btn" data-day-id="${
                day.id
              }">
                <i class="fas fa-plus"></i> Adicionar
              </button>
            </div>
            <div class="drop-zone" data-id="${day.id}">
              ${this.renderAllocatedPeople(day.allocatedPeople, day.date)}
            </div>
          </div>
        </div>`;

      // Event listeners
      col.querySelector(".remove-day-btn").onclick = () => onRemoveDay(day.id);
      col.querySelector(".edit-day-btn").onclick = () => onEditDay(day.id);
      col.querySelector(".add-person-to-day-btn").onclick = () =>
        onAddPersonToDay(day.id);

      // Drop zone functionality
      this.setupDropZone(col.querySelector(".drop-zone"), day, onDrop);

      // Person item functionality
      this.setupPersonItems(col, day, onRemovePersonFromDay, onEditAllocation);

      cont.appendChild(col);
    });
  }

  // Renderizar pessoas alocadas em um dia
  renderAllocatedPeople(allocatedPeople, date) {
    return allocatedPeople
      .map(
        (person) => `
        <div class="person-item" draggable="true" data-id="${
          person.id
        }" data-date="${date}">
          <div class="person-header role-${person.role
            .toLowerCase()
            .replace(/[^a-z]/g, "")}">
            <span>${person.name}</span>
            <button class="remove-person-from-day">&times;</button>
          </div>
          <div class="person-body">
            <strong>Função:</strong> ${person.role}
          </div>
        </div>`
      )
      .join("");
  }

  // Configurar zona de drop
  setupDropZone(dropZone, day, onDrop) {
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      const dragData = e.dataTransfer.getData("text/plain");
      onDrop(dragData, day);
    });
  }

  // Configurar itens de pessoa
  setupPersonItems(container, day, onRemovePersonFromDay, onEditAllocation) {
    container.querySelectorAll(".person-item").forEach((el) => {
      // Drag functionality
      el.addEventListener("dragstart", (e) => {
        const period = day.period || "Dia todo";
        e.dataTransfer.setData(
          "text/plain",
          `allocated:${el.dataset.id}:${el.dataset.date}:${period}`
        );
      });

      // Click to edit
      el.onclick = () => onEditAllocation(el.dataset.id, el.dataset.date);

      // Remove button
      const removeBtn = el.querySelector(".remove-person-from-day");
      if (removeBtn) {
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          onRemovePersonFromDay(el.dataset.id, day);
        };
      }
    });
  }

  // Preencher modal para adicionar pessoa ao dia
  fillAddPersonModal(day, people, roles) {
    const displayDate = this.formatDate(day.date);
    const dayOfWeek = this.getDayOfWeek(day.date);
    const period = day.period || "Dia todo";

    document.getElementById(
      "addPersonDayInfo"
    ).textContent = `${dayOfWeek} - ${displayDate} (${period})`;

    // Pessoas disponíveis (não já alocadas neste dia)
    const availablePeople = people.filter(
      (p) => !day.allocatedPeople.find((ap) => ap.id === p.id)
    );
    availablePeople.sort((a, b) => a.name.localeCompare(b.name));

    // Preencher datalist
    const datalist = document.getElementById("peopleOptions");
    datalist.innerHTML = "";
    availablePeople.forEach((person) => {
      const option = document.createElement("option");
      option.value = person.name;
      option.dataset.id = person.id;
      datalist.appendChild(option);
    });

    // Preencher select de funções
    const selectRole = document.getElementById("selectRoleForPerson");
    selectRole.innerHTML = "";
    const sortedRoles = [...roles].sort((a, b) => a.localeCompare(b));
    sortedRoles.forEach((role) => {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      selectRole.appendChild(option);
    });

    // Limpar input
    document.getElementById("selectPersonToAdd").value = "";

    return availablePeople.length > 0;
  }

  // Preencher modal de edição de alocação
  fillEditAllocationModal(allocation, day, roles) {
    document.getElementById("editAllocName").textContent = allocation.name;

    const displayDate = this.formatDate(day.date);
    const period = day.period || "Dia todo";
    document.getElementById(
      "editAllocDate"
    ).textContent = `${displayDate} (${period})`;

    const select = document.getElementById("editAllocRole");
    select.innerHTML = "";

    const sortedRoles = [...roles].sort((a, b) => a.localeCompare(b));
    sortedRoles.forEach((role) => {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      option.selected = role === allocation.role;
      select.appendChild(option);
    });
  }
}
