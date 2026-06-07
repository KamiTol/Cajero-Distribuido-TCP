# Cliente Java para el cajero TCP

Este cliente usa `Socket` de Java y se comunica con el servidor Node.js usando JSON por línea.

## Requisitos

- Java 17 o superior

## Ejecutar

```bash
cd java-client
javac -d out src/main/java/com/cajero/ClienteTcp.java
java -cp out com.cajero.ClienteTcp
```

## Pasar host y puerto

```bash
javac -d out src/main/java/com/cajero/ClienteTcp.java
java -cp out com.cajero.ClienteTcp 192.168.1.50 3000
```

## Flujo

1. Pide la IP o host del servidor.
2. Pide el puerto.
3. Pide la tarjeta una sola vez.
4. En cada operación pide la clave.
