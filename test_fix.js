// Simular las funciones del código original
function toLocalISO(date) {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
}

function getGoogleDateRange(preset) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (preset === 'last_7d') {
        // End: yesterday (today - 1)
        const e = new Date(today); e.setDate(e.getDate() - 1);
        // Start: 7 days ago from yesterday (yesterday - 7 + 1 = yesterday - 6)
        const s = new Date(e); s.setDate(s.getDate() - 7 + 1);
        return { since: toLocalISO(s), until: toLocalISO(e) };
    } else if (preset === 'last_14d') {
        const e = new Date(today); e.setDate(e.getDate() - 1);
        const s = new Date(e); s.setDate(s.getDate() - 14 + 1);
        return { since: toLocalISO(s), until: toLocalISO(e) };
    } else if (preset === 'last_30d') {
        const e = new Date(today); e.setDate(e.getDate() - 1);
        const s = new Date(e); s.setDate(s.getDate() - 30 + 1);
        return { since: toLocalISO(s), until: toLocalISO(e) };
    }
    return null;
}

function getGooglePrevDateRange(preset) {
    // Obtener las fechas reales del periodo actual usando getGoogleDateRange
    const currentRange = getGoogleDateRange(preset);
    if (!currentRange) return null;
    
    const currentStart = new Date(currentRange.since);
    const currentEnd = new Date(currentRange.until);
    
    // Calcular periodo anterior basado en la duración del periodo actual
    const days = Math.round((currentEnd - currentStart) / 86400000) + 1;
    const until = new Date(currentStart); until.setDate(until.getDate() - 1);
    const since = new Date(until); since.setDate(since.getDate() - days + 1);
    
    return { since: toLocalISO(since), until: toLocalISO(until) };
}

// Probar con el caso del usuario: 31 marzo al 6 abril (7 días)
// Simulamos que hoy es 7 de abril de 2024
const originalToday = Date.prototype.constructor.today;
Date.prototype.constructor.today = function() {
    return new Date('2024-04-07');
};

// Sobrescribir para la prueba
const realDate = Date;
global.Date = class extends realDate {
    constructor(...args) {
        if (args.length === 0) {
            super('2024-04-07T00:00:00'); // Simular hoy como 7 de abril
        } else {
            super(...args);
        }
    }
    static now() {
        return new realDate('2024-04-07T00:00:00').getTime();
    }
};

console.log("=== Prueba con fecha simulada: 7 de abril de 2024 ===");
const currentRange = getGoogleDateRange('last_7d');
console.log("Periodo Actual (last_7d):", currentRange.since, "a", currentRange.until);

const prevRange = getGooglePrevDateRange('last_7d');
console.log("Periodo Anterior:", prevRange.since, "a", prevRange.until);

// Calcular crecimiento
const currentLeads = 12;
const previousLeads = 8;
const growth = ((currentLeads - previousLeads) / previousLeads) * 100;
console.log(`\nCrecimiento calculado: ${growth.toFixed(1)}%`);
console.log(`Esperado: 50% (de 8 a 12 leads)`);

// Restaurar Date
global.Date = realDate;
