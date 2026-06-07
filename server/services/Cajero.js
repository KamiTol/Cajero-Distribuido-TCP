const ICajero = require("../../common/interfaces/ICajero");
const cuentas = require("../data/Cuentas");

class Cajero extends ICajero {

    autenticar(clave, tar) {

        const cuenta = cuentas.find(
            c => c.tar === tar
        );

        if (!cuenta) {
            return null;
        }

        if (cuenta.clave !== clave) {
            return null;
        }

        return cuenta;
    }

    dep(dinero, clave, tar) {

        try {

            const cuenta =
                this.autenticar(clave, tar);

            if (!cuenta) {
                return "NOT_OK";
            }

            if (dinero <= 0) {
                return "NOT_OK";
            }

            cuenta.saldo += dinero;

            return "OK";

        } catch {

            return "ERROR";
        }
    }

    ret(dinero, clave, tar) {

        try {

            const cuenta =
                this.autenticar(clave, tar);

            if (!cuenta) {
                return "NOT_OK";
            }

            if (dinero <= 0) {
                return "NOT_OK";
            }

            if (cuenta.saldo < dinero) {
                return "NOT_OK";
            }

            cuenta.saldo -= dinero;

            return "OK";

        } catch {

            return "ERROR";
        }
    }

    con(clave, tar) {

        try {

            const cuenta =
                this.autenticar(clave, tar);

            if (!cuenta) {
                return {
                    ok: false,
                    mensaje: "NOT_OK"
                };
            }

            return {
                ok: true,
                mensaje: "OK",
                saldo: cuenta.saldo
            };

        } catch {

            return {
                ok: false,
                mensaje: "ERROR"
            };
        }
    }
}

module.exports = Cajero;