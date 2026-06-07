const net = require("net");
const Cajero = require("./server/services/Cajero");

const puerto = process.env.PORT || 3000;
const cajero = new Cajero();

function enviar(socket, data) {
    socket.write(`${JSON.stringify(data)}\n`);
}

function manejarPeticion(data) {
    if (!data || typeof data !== "object") {
        return {
            ok: false,
            mensaje: "ERROR"
        };
    }

    const tarjeta = data.tarjeta;
    const clave = data.clave;

    switch (data.accion) {
        case "retirar": {
            const monto = Number(data.monto);
            const resultado = cajero.ret(monto, clave, tarjeta);

            return {
                ok: resultado === "OK",
                mensaje: resultado
            };
        }

        case "consignar": {
            const monto = Number(data.monto);
            const resultado = cajero.dep(monto, clave, tarjeta);

            return {
                ok: resultado === "OK",
                mensaje: resultado
            };
        }

        case "consultar": {
            return cajero.con(clave, tarjeta);
        }

        default:
            return {
                ok: false,
                mensaje: "ERROR"
            };
    }
}

const servidor = net.createServer(socket => {
    console.log(`Cliente conectado desde ${socket.remoteAddress}:${socket.remotePort}`);

    let buffer = "";

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

            let data;
            try {
                data = JSON.parse(linea);
            } catch {
                enviar(socket, {
                    ok: false,
                    mensaje: "ERROR"
                });
                continue;
            }

            const respuesta = manejarPeticion(data);
            enviar(socket, respuesta);
        }
    });

    socket.on("close", () => {
        console.log("Cliente desconectado");
    });

    socket.on("error", error => {
        console.error("Error de socket:", error.message);
    });
});

servidor.listen(puerto, () => {
    console.log(`Servidor TCP escuchando en 0.0.0.0:${puerto}`);
});