const prompt = require("prompt-sync")({ sigint: true });
const net = require("net");

const host = process.env.SOCKET_HOST || "127.0.0.1";
const port = Number(process.env.SOCKET_PORT || 3000);

function conectar() {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port }, () => {
            resolve(socket);
        });

        socket.once("error", reject);
    });
}

function crearCanal(socket) {
    let buffer = "";
    const pendientes = [];

    socket.on("data", chunk => {
        buffer += chunk.toString("utf8");

        let separador = buffer.indexOf("\n");
        while (separador !== -1) {
            const linea = buffer.slice(0, separador).trim();
            buffer = buffer.slice(separador + 1);
            separador = buffer.indexOf("\n");

            if (!linea) {
                continue;
            }

            const resolver = pendientes.shift();
            if (!resolver) {
                continue;
            }

            try {
                resolver.resolve(JSON.parse(linea));
            } catch (error) {
                resolver.reject(error);
            }
        }
    });

    socket.on("error", error => {
        while (pendientes.length > 0) {
            pendientes.shift().reject(error);
        }
    });

    return {
        enviar(datos) {
            return new Promise((resolve, reject) => {
                pendientes.push({ resolve, reject });
                socket.write(`${JSON.stringify(datos)}\n`);
            });
        }
    };
}

async function main() {
    let socket;
    try {
        socket = await conectar();
    } catch (error) {
        console.error("No se pudo conectar al servidor TCP:");
        console.error(error.message);
        process.exit(1);
    }

    const canal = crearCanal(socket);

    async function emitir(accion, datos) {
        return canal.enviar({
            accion,
            ...datos
        });
    }

    console.log("===== CAJERO =====");

    const tarjeta = prompt("Tarjeta: ");

    let opcion;

    do {
        console.log("\n1. Retirar");
        console.log("2. Consignar");
        console.log("3. Consultar");
        console.log("4. Salir");

        opcion = prompt("Seleccione una opcion: ");

        switch (opcion) {
            case "1": {
                const retiro = Number(prompt("Monto: "));
                const clave = prompt("Clave: ");
                const respuesta = await emitir("retirar", {
                    monto: retiro,
                    tarjeta,
                    clave
                });

                console.log(respuesta?.mensaje || "NOT_OK");
                break;
            }

            case "2": {
                const deposito = Number(prompt("Monto: "));
                const clave = prompt("Clave: ");
                const respuesta = await emitir("consignar", {
                    monto: deposito,
                    tarjeta,
                    clave
                });

                console.log(respuesta?.mensaje || "NOT_OK");
                break;
            }

            case "3": {
                const clave = prompt("Clave: ");
                const respuesta = await emitir("consultar", {
                    tarjeta,
                    clave
                });

                if (respuesta?.ok) {
                    console.log(`\nSaldo disponible: $${respuesta.saldo}`);
                } else {
                    console.log(respuesta?.mensaje || "NOT_OK");
                }

                break;
            }

            case "4":
                console.log("Sesion finalizada");
                socket.end();
                break;

            default:
                console.log("Opcion invalida");
        }
    } while (opcion !== "4");

    socket.destroy();
}

main();