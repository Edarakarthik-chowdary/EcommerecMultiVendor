package com.Karthik.payload;

public record LoginRequest(
        String email,
        String password
) {
}