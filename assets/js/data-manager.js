/**
 * Data Manager - Gerencia o armazenamento e persistência dos dados
 */
class DataManager {
  constructor() {
    this.storageKeys = {
      people: "cron_people",
      days: "cron_days",
      roles: "cron_roles",
      roleColors: "cron_role_colors",
    };

    // Paleta de cores predefinidas para funções
    this.colorPalette = [
      "#28a745",
      "#fd7e14",
      "#007bff",
      "#6f42c1",
      "#e83e8c",
      "#17a2b8",
      "#ffc107",
      "#dc3545",
      "#20c997",
      "#6c757d",
      "#f8f9fa",
      "#343a40",
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#f39c12",
      "#9b59b6",
      "#e74c3c",
      "#2ecc71",
      "#f1c40f",
      "#3498db",
      "#e67e22",
      "#95a5a6",
      "#34495e",
    ];
  }

  // Carregar dados do localStorage
  loadData() {
    return {
      people: JSON.parse(localStorage.getItem(this.storageKeys.people) || "[]"),
      scheduleDays: JSON.parse(
        localStorage.getItem(this.storageKeys.days) || "[]"
      ),
      roles: JSON.parse(
        localStorage.getItem(this.storageKeys.roles) ||
          '["Transmissão", "Fotos"]'
      ),
      roleColors: JSON.parse(
        localStorage.getItem(this.storageKeys.roleColors) ||
          '{"Transmissão": "#28a745", "Fotos": "#fd7e14"}'
      ),
    };
  }

  // Salvar dados no localStorage
  saveData(data) {
    localStorage.setItem(this.storageKeys.people, JSON.stringify(data.people));
    localStorage.setItem(
      this.storageKeys.days,
      JSON.stringify(data.scheduleDays)
    );
    localStorage.setItem(this.storageKeys.roles, JSON.stringify(data.roles));
    localStorage.setItem(
      this.storageKeys.roleColors,
      JSON.stringify(data.roleColors)
    );
  }

  // Gerar cor para uma função
  getColorForRole(role, roles, roleColors) {
    if (roleColors[role]) {
      return roleColors[role];
    }

    const roleIndex = roles.indexOf(role);
    const color = this.colorPalette[roleIndex % this.colorPalette.length];
    roleColors[role] = color;
    return color;
  }

  // Verificar se uma cor é clara (para definir a cor do texto)
  isLightColor(color) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  // Limpar todos os dados
  clearAllData() {
    localStorage.removeItem(this.storageKeys.people);
    localStorage.removeItem(this.storageKeys.days);
    localStorage.removeItem(this.storageKeys.roles);
    localStorage.removeItem(this.storageKeys.roleColors);
  }
}
