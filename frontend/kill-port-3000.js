const { execSync } = require('child_process');

try {
  console.log('Buscando procesos en el puerto 3000...');
  const stdout = execSync('lsof -t -i :3000').toString().trim();
  if (stdout) {
    const pids = stdout.split('\n');
    console.log(`Procesos encontrados en puerto 3000: ${pids.join(', ')}`);
    pids.forEach((pid) => {
      try {
        process.kill(parseInt(pid, 10), 'SIGKILL');
        console.log(`Proceso ${pid} terminado exitosamente.`);
      } catch (killErr) {
        console.error(`No se pudo terminar el proceso ${pid}:`, killErr.message);
      }
    });
  } else {
    console.log('El puerto 3000 está libre.');
  }
} catch (err) {
  // lsof returns exit code 1 if no process is found, which throws in execSync
  if (err.status === 1) {
    console.log('El puerto 3000 está libre.');
  } else {
    console.error('Error al intentar liberar el puerto 3000:', err.message);
  }
}
