/**
 * Encodeur base64 minimal, sans dépendance native, pour convertir un
 * ArrayBuffer (réponse axios `responseType: 'arraybuffer'`) en chaîne base64
 * utilisable dans une data URI (`data:image/jpeg;base64,...`).
 *
 * Utile pour afficher des images protégées par JWT dans <Image> : le
 * composant natif <Image> de React Native (surtout sous Expo Go) ne
 * transmet pas toujours fiablement le prop `headers` pour les requêtes
 * réseau, contrairement à axios qui injecte déjà le Bearer token.
 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : undefined;
    const b3 = i + 2 < len ? bytes[i + 2] : undefined;

    result += CHARS[b1 >> 2];
    result += CHARS[((b1 & 0x03) << 4) | ((b2 ?? 0) >> 4)];
    result += b2 !== undefined ? CHARS[((b2 & 0x0f) << 2) | ((b3 ?? 0) >> 6)] : '=';
    result += b3 !== undefined ? CHARS[b3 & 0x3f] : '=';
  }

  return result;
}
