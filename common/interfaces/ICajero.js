class ICajero {

    dep(dinero, clave, tar) {
        throw new Error("Error");
    }

    ret(dinero, clave, tar) {
        throw new Error("Error");
    }

    con(clave, tar) {
        throw new Error("Error");
    }
}

module.exports = ICajero;