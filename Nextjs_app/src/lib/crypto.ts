/**
 * End-to-End Encryption Utility
 *
 * Uses Web Crypto API for secure message encryption:
 * - ECDH (P-256) for key exchange
 * - AES-GCM (256-bit) for message encryption
 * - Keys stored in IndexedDB for persistence
 */

const DB_NAME = 'carpool_crypto';
const DB_VERSION = 1;
const KEYS_STORE = 'keys';

// Types
export interface EncryptedMessage {
  ciphertext: string; // Base64 encoded
  iv: string;         // Base64 encoded initialization vector
  senderPublicKey: string; // Base64 encoded public key (for key derivation)
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(KEYS_STORE)) {
        db.createObjectStore(KEYS_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function storeKey(id: string, keyData: ArrayBuffer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEYS_STORE, 'readwrite');
    const store = tx.objectStore(KEYS_STORE);
    const request = store.put({ id, keyData });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getStoredKey(id: string): Promise<ArrayBuffer | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEYS_STORE, 'readonly');
    const store = tx.objectStore(KEYS_STORE);
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.keyData || null);
  });
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate ECDH key pair for a user
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Export public key to Base64 string (for storing in Firestore)
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import public key from Base64 string
 */
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(base64Key);
  return crypto.subtle.importKey(
    'spki',
    keyBuffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Export private key to ArrayBuffer (for IndexedDB storage)
 */
export async function exportPrivateKey(privateKey: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('pkcs8', privateKey);
}

/**
 * Import private key from ArrayBuffer
 */
export async function importPrivateKey(keyBuffer: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

/**
 * Store user's private key for a chat in IndexedDB
 */
export async function storePrivateKey(chatId: string, userId: string, privateKey: CryptoKey): Promise<void> {
  const keyBuffer = await exportPrivateKey(privateKey);
  await storeKey(`${chatId}:${userId}`, keyBuffer);
}

/**
 * Retrieve user's private key for a chat from IndexedDB
 */
export async function getPrivateKey(chatId: string, userId: string): Promise<CryptoKey | null> {
  const keyBuffer = await getStoredKey(`${chatId}:${userId}`);
  if (!keyBuffer) return null;
  return importPrivateKey(keyBuffer);
}

/**
 * Derive shared AES key from ECDH key exchange
 */
async function deriveSharedKey(
  privateKey: CryptoKey,
  otherPublicKey: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: otherPublicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a message using the shared key
 */
export async function encryptMessage(
  plaintext: string,
  myPrivateKey: CryptoKey,
  myPublicKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<EncryptedMessage> {
  // Derive shared key
  const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKey);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encode plaintext
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    sharedKey,
    plaintextBuffer
  );

  // Export my public key for the message
  const senderPublicKey = await exportPublicKey(myPublicKey);

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
    senderPublicKey,
  };
}

/**
 * Decrypt a message using the shared key
 */
export async function decryptMessage(
  encryptedMessage: EncryptedMessage,
  myPrivateKey: CryptoKey
): Promise<string> {
  // Import sender's public key
  const senderPublicKey = await importPublicKey(encryptedMessage.senderPublicKey);

  // Derive shared key (same as sender derived)
  const sharedKey = await deriveSharedKey(myPrivateKey, senderPublicKey);

  // Decode ciphertext and IV
  const ciphertext = base64ToArrayBuffer(encryptedMessage.ciphertext);
  const iv = base64ToArrayBuffer(encryptedMessage.iv);

  // Decrypt
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    sharedKey,
    ciphertext
  );

  // Decode plaintext
  const decoder = new TextDecoder();
  return decoder.decode(plaintextBuffer);
}

/**
 * Encrypt location data
 */
export async function encryptLocation(
  location: { lat: number; lng: number },
  myPrivateKey: CryptoKey,
  myPublicKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<EncryptedMessage> {
  const locationString = JSON.stringify(location);
  return encryptMessage(locationString, myPrivateKey, myPublicKey, theirPublicKey);
}

/**
 * Decrypt location data
 */
export async function decryptLocation(
  encryptedLocation: EncryptedMessage,
  myPrivateKey: CryptoKey
): Promise<{ lat: number; lng: number }> {
  const locationString = await decryptMessage(encryptedLocation, myPrivateKey);
  return JSON.parse(locationString);
}

/**
 * Check if encryption is supported in this browser
 */
export function isEncryptionSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof indexedDB !== 'undefined'
  );
}
