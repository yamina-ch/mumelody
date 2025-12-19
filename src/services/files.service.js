// src/services/files.service.js
import { pb } from "../pb.js";

/**
 * Devuelve la URL pública de un archivo en PocketBase.
 * record = fila de la colección
 * file = nombre del archivo
 * size = thumbnail opcional → "100x100", "300x300", etc.
 */
export function fileUrl(record, file, size = "") {
  if (!record || !file) return "";

  return pb.files.getUrl(record, file, {
    thumb: size, // PocketBase generará miniatura si procede
  });
}

