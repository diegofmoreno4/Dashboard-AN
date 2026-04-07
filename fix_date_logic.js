// Función auxiliar para calcular fechas dinámicas
function getDynamicDateRanges(since, until) {
    const startDate = new Date(since);
    const endDate = new Date(until);
    
    // Calcular duración en días
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque es inclusivo
    
    // Periodo Actual (ya definido por since/until)
    const currentPeriod = { start: startDate, end: endDate };
    
    // Periodo Anterior: Restar 'diffDays' al inicio y fin del periodo actual
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - diffDays);
    
    const prevEndDate = new Date(endDate);
    prevEndDate.setDate(endDate.getDate() - diffDays);
    
    const previousPeriod = { start: prevStartDate, end: prevEndDate };
    
    return {
        current: currentPeriod,
        previous: previousPeriod,
        days: diffDays
    };
}

// Función para formatear fecha a YYYY-MM-DD (ajustando zona horaria local)
function formatDateLocal(date) {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
}

// Ejemplo de uso dentro de tu lógica de reporte:
function calculateGrowth(currentValue, previousValue) {
    if (previousValue === 0) {
        return currentValue > 0 ? 100 : 0; // Evitar división por cero
    }
    return ((currentValue - previousValue) / previousValue) * 100;
}

// Simulación del caso reportado:
// Hoy es 7 de abril (ejemplo), así que "ayer" es 6 de abril.
// Últimos 7 días: 31 de marzo al 6 de abril.
const since = "2024-03-31";
const until = "2024-04-06";

const ranges = getDynamicDateRanges(since, until);

console.log("Periodo Actual:", formatDateLocal(ranges.current.start), "a", formatDateLocal(ranges.current.end));
console.log("Periodo Anterior Calculado:", formatDateLocal(ranges.previous.start), "a", formatDateLocal(ranges.previous.end));

const currentLeads = 12;
const previousLeads = 8;

const growth = calculateGrowth(currentLeads, previousLeads);
console.log(`Crecimiento: ${growth.toFixed(1)}% (Debería ser 50%)`);
