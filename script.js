// ==========================================
// MODELOS Y LÓGICA (POO)
// ==========================================
class BudgetItem {
    constructor(name, amount, type, freq) {
        this.id = Date.now();
        this.name = name;
        this.amount = parseFloat(amount);
        this.type = type;
        this.freq = parseFloat(freq);
    }
    // Normalización: Todo se calcula sobre base mensual
    getMonthlyValue() { return (this.amount / this.freq) * 4.33; }
}

class BudgetManager {
    constructor() { this.items = []; }
    addItem(item) { this.items.push(item); }
    removeItem(id) { this.items = this.items.filter(i => i.id !== id); }

    calculate() {
        let inc = 0, exp = 0;
        this.items.forEach(i => i.type === 'ingreso' ? inc += i.getMonthlyValue() : exp += i.getMonthlyValue());
        return { inc, exp, bal: inc - exp, pct: inc > 0 ? (exp / inc) * 100 : 0 };
    }
}

// ==========================================
// GESTIÓN DE GRÁFICOS (Chart.js)
// ==========================================
class UICharts {
    constructor() {
        this.bar = null;
        this.pie = null;
    }

    update(inc, exp) {
        if (this.bar) this.bar.destroy();
        if (this.pie) this.pie.destroy();

        const commonOpts = {
            responsive: true,
            maintainAspectRatio: false, // CLAVE: Permite que el gráfico respete el alto del contenedor CSS
            plugins: { legend: { labels: { boxWidth: 12, font: { size: 11 } } } }
        };

        // Gráfico de Barras
        this.bar = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{ data: [inc, exp], backgroundColor: ['#2ecc71', '#e74c3c'] }]
            },
            options: { ...commonOpts, plugins: { legend: { display: false } } }
        });

        // Gráfico de Torta
        this.pie = new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{ data: [inc || 1, exp], backgroundColor: ['#2ecc71', '#e74c3c'] }]
            },
            options: commonOpts
        });
    }
}

// ==========================================
// CONTROLADOR DE LA APP
// ==========================================
class App {
    constructor() {
        this.manager = new BudgetManager();
        this.uiCharts = new UICharts();
        this.setup();
    }

    setup() {
        document.getElementById('btnAdd').onclick = () => this.handleAdd();
        this.refresh();
    }

    handleAdd() {
        const name = document.getElementById('itemName');
        const amount = document.getElementById('itemAmount');
        const type = document.getElementById('itemType').value;
        const freq = document.getElementById('itemFrequency').value;

        if (!name.value || !amount.value) return alert("Completa los datos");

        const item = new BudgetItem(name.value, amount.value, type, freq);
        this.manager.addItem(item);
        this.renderItem(item);
        this.refresh();

        name.value = ''; amount.value = '';
    }

    renderItem(item) {
        const list = document.getElementById('budgetList');
        const div = document.createElement('div');
        div.className = `budget-item ${item.type}`;
        div.id = `i-${item.id}`;
        div.innerHTML = `
            <div><strong>${item.name}</strong></div>
            <button class="btn-del" onclick="app.remove(${item.id})">Eliminar</button>
        `;
        list.prepend(div);
    }

    remove(id) {
        this.manager.removeItem(id);
        document.getElementById(`i-${id}`).remove();
        this.refresh();
    }

    refresh() {
        const s = this.manager.calculate();
        document.getElementById('totalIngresos').innerText = `$${Math.round(s.inc).toLocaleString()}`;
        document.getElementById('totalGastos').innerText = `$${Math.round(s.exp).toLocaleString()}`;
        document.getElementById('totalBalance').innerText = `$${Math.round(s.bal).toLocaleString()}`;
        document.getElementById('percentage').innerText = `${s.pct.toFixed(1)}%`;
        
        document.getElementById('totalBalance').style.color = s.bal < 0 ? "#e74c3c" : "#2ecc71";
        this.uiCharts.update(s.inc, s.exp);
    }
}

const app = new App();