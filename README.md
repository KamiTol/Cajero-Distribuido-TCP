# Cajero con sockets TCP

Este proyecto usa sockets TCP puros para permitir varios clientes conectados al mismo servidor, similar al esquema de la carpeta `Sockets` de referencia.

## Ejecutar servidor

```bash
npm start
```

## Ejecutar cliente

```bash
npm run client
```

## Flujo

1. El cliente pide la tarjeta una sola vez.
2. Luego muestra el menú.
3. Antes de cada operación pide la clave.
4. El servidor valida cada petición de forma independiente, sin sesión.

## Probar con dos clientes

Abre dos terminales o dos VMs y ejecuta `npm run client` en ambas contra el mismo servidor.