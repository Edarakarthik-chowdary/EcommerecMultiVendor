package com.Karthik.payload;

public record RegisterRequest(
        String fullName,
        String email,
        String password,
        String mobile
) {
}