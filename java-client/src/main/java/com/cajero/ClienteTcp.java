package com.cajero;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class ClienteTcp {
    private static final Scanner INPUT = new Scanner(System.in, StandardCharsets.UTF_8);

    public static void main(String[] args) {
        String host = args.length > 0 ? args[0] : prompt("IP o host del servidor: ");
        int port = args.length > 1 ? Integer.parseInt(args[1]) : Integer.parseInt(prompt("Puerto del servidor: ", "3000"));

        try (Socket socket = new Socket(host, port);
             BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
               PrintWriter writer = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true)) {

            System.out.println("Conectado a " + host + ":" + port);
            String tarjeta = prompt("Tarjeta: ");

            boolean running = true;
            while (running) {
                System.out.println();
                System.out.println("1. Retirar");
                System.out.println("2. Consignar");
                System.out.println("3. Consultar");
                System.out.println("4. Salir");

                String opcion = prompt("Seleccione una opcion: ");

                switch (opcion) {
                    case "1": {
                        String monto = prompt("Monto: ");
                        String clave = prompt("Clave: ");
                        String respuesta = enviarPeticion(writer, reader, crearPeticion("retirar", tarjeta, clave, monto));
                        imprimirRespuesta(respuesta);
                        break;
                    }
                    case "2": {
                        String monto = prompt("Monto: ");
                        String clave = prompt("Clave: ");
                        String respuesta = enviarPeticion(writer, reader, crearPeticion("consignar", tarjeta, clave, monto));
                        imprimirRespuesta(respuesta);
                        break;
                    }
                    case "3": {
                        String clave = prompt("Clave: ");
                        String respuesta = enviarPeticion(writer, reader, crearPeticion("consultar", tarjeta, clave, null));
                        if (respuestaOk(respuesta)) {
                            System.out.println("\nSaldo disponible: $" + extraerValor(respuesta, "saldo"));
                        } else {
                            System.out.println(extraerTexto(respuesta, "mensaje", "NOT_OK"));
                        }
                        break;
                    }
                    case "4": {
                        System.out.println("Sesion finalizada");
                        running = false;
                        break;
                    }
                    default:
                        System.out.println("Opcion invalida");
                }
            }
        } catch (IOException e) {
            System.err.println("No se pudo conectar al servidor TCP:");
            System.err.println(e.getMessage());
        }
    }

    private static String prompt(String message) {
        System.out.print(message);
        return INPUT.nextLine().trim();
    }

    private static String prompt(String message, String defaultValue) {
        System.out.print(message + " [" + defaultValue + "]: ");
        String value = INPUT.nextLine().trim();
        return value.isEmpty() ? defaultValue : value;
    }

    private static String crearPeticion(String accion, String tarjeta, String clave, String monto) {
        StringBuilder json = new StringBuilder();
        json.append('{');
        json.append("\"accion\":\"").append(escape(accion)).append("\"");
        json.append(",\"tarjeta\":\"").append(escape(tarjeta)).append("\"");
        json.append(",\"clave\":\"").append(escape(clave)).append("\"");
        if (monto != null) {
            json.append(",\"monto\":").append(monto);
        }
        json.append('}');
        return json.toString();
    }

    private static String enviarPeticion(PrintWriter writer, BufferedReader reader, String peticion) throws IOException {
        writer.println(peticion);
        String linea = reader.readLine();
        if (linea == null) {
            throw new IOException("El servidor cerro la conexion");
        }
        return linea;
    }

    private static void imprimirRespuesta(String respuesta) {
        if (respuestaOk(respuesta)) {
            System.out.println(extraerTexto(respuesta, "mensaje", "OK"));
        } else {
            System.out.println(extraerTexto(respuesta, "mensaje", "NOT_OK"));
        }
    }

    private static boolean respuestaOk(String json) {
        return json.contains("\"ok\":true");
    }

    private static String extraerValor(String json, String campo) {
        return extraerTexto(json, campo, "0");
    }

    private static String extraerTexto(String json, String campo, String valorPorDefecto) {
        String patron = "\"" + campo + "\":";
        int inicio = json.indexOf(patron);
        if (inicio < 0) {
            return valorPorDefecto;
        }

        inicio += patron.length();
        if (inicio >= json.length()) {
            return valorPorDefecto;
        }

        char primerCaracter = json.charAt(inicio);
        if (primerCaracter == '"') {
            int fin = json.indexOf('"', inicio + 1);
            if (fin < 0) {
                return valorPorDefecto;
            }
            return json.substring(inicio + 1, fin);
        }

        int fin = inicio;
        while (fin < json.length()) {
            char actual = json.charAt(fin);
            if (actual == ',' || actual == '}') {
                break;
            }
            fin++;
        }
        return json.substring(inicio, fin).trim();
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
