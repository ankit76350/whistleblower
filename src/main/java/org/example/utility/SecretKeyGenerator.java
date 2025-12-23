package org.example.utility;

import java.security.SecureRandom;

public final class SecretKeyGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();

    private SecretKeyGenerator() {
        // prevent instantiation
    }

    public static String generateSecretKey() {
        byte[] bytes = new byte[32]; // 64 hex chars
        secureRandom.nextBytes(bytes);
        return bytesToHex(bytes);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
