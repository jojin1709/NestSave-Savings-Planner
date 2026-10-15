package com.nestsave.data.security

import org.json.JSONObject
import java.security.SecureRandom
import java.security.spec.KeySpec
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import java.security.MessageDigest

object VaultSecurity {

    private fun bytesToHex(bytes: ByteArray): String {
        return bytes.joinToString("") { "%02x".format(it) }
    }

    private fun hexToBytes(hex: String): ByteArray {
        val bytes = ByteArray(hex.length / 2)
        for (i in hex.indices step 2) {
            bytes[i / 2] = hex.substring(i, i + 2).toInt(16).toByte()
        }
        return bytes
    }

    /**
     * Hashes a 4-digit PIN with a 16-byte cryptographic salt using SHA-256.
     */
    fun hashPin(pin: String, existingSalt: String? = null): Pair<String, String> {
        val salt = if (!existingSalt.isNullOrBlank()) {
            existingSalt
        } else {
            val randomBytes = ByteArray(16)
            SecureRandom().nextBytes(randomBytes)
            bytesToHex(randomBytes)
        }

        val digest = MessageDigest.getInstance("SHA-256")
        val input = (salt + ":" + pin.trim()).toByteArray(Charsets.UTF_8)
        val hashBytes = digest.digest(input)
        val hash = bytesToHex(hashBytes)

        return Pair(hash, salt)
    }

    /**
     * Verifies if entered PIN matches the stored hash and salt.
     */
    fun verifyPin(pin: String, storedHash: String, salt: String): Boolean {
        val (computedHash, _) = hashPin(pin, salt)
        return MessageDigest.isEqual(computedHash.toByteArray(), storedHash.toByteArray())
    }

    /**
     * Encrypts plain JSON vault backup using PBKDF2 + AES-GCM 256
     * Format matches NestSave Web Crypto standard.
     */
    fun encryptVault(plainJson: String, password: String): String {
        val random = SecureRandom()
        val salt = ByteArray(16)
        val iv = ByteArray(12)
        random.nextBytes(salt)
        random.nextBytes(iv)

        // PBKDF2 Key Derivation (100,000 iterations, 256 bits)
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, 100000, 256)
        val secretKey = factory.generateSecret(spec)
        val aesKey = SecretKeySpec(secretKey.encoded, "AES")

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, aesKey, gcmSpec)

        val ciphertext = cipher.doFinal(plainJson.toByteArray(Charsets.UTF_8))

        val json = JSONObject()
        json.put("version", 1)
        json.put("format", "nestsave-encrypted-vault")
        json.put("salt", bytesToHex(salt))
        json.put("iv", bytesToHex(iv))
        json.put("ciphertext", bytesToHex(ciphertext))

        return json.toString(2)
    }

    /**
     * Decrypts AES-GCM 256 encrypted vault backup file using user password.
     */
    fun decryptVault(encryptedJsonString: String, password: String): String {
        val json = JSONObject(encryptedJsonString)
        val format = json.optString("format")
        if (format != "nestsave-encrypted-vault") {
            throw IllegalArgumentException("Invalid or unsupported encrypted vault file format.")
        }

        val salt = hexToBytes(json.getString("salt"))
        val iv = hexToBytes(json.getString("iv"))
        val ciphertext = hexToBytes(json.getString("ciphertext"))

        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, 100000, 256)
        val secretKey = factory.generateSecret(spec)
        val aesKey = SecretKeySpec(secretKey.encoded, "AES")

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, aesKey, gcmSpec)

        val decryptedBytes = cipher.doFinal(ciphertext)
        return String(decryptedBytes, Charsets.UTF_8)
    }
}
