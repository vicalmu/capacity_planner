import { execSync } from 'child_process';

const PORT = 3000;

try {
    // Encuentra el PID del proceso que usa el puerto 3000
    const findCommand = `lsof -i :${PORT} -t`;
    const pid = execSync(findCommand, { encoding: 'utf-8' }).trim();
    
    if (pid) {
        // Mata el proceso
        console.log(`🔄 Liberando puerto ${PORT} (PID: ${pid})...`);
        execSync(`kill -9 ${pid}`);
        console.log(`✅ Puerto ${PORT} liberado`);
    } else {
        console.log(`✅ Puerto ${PORT} ya está libre`);
    }
} catch (error) {
    // Si no hay proceso usando el puerto, lsof devolverá un error
    console.log(`✅ Puerto ${PORT} ya está libre`);
}
