package com.Karthik;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Scanner;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your new admin password: ");
        String password = scanner.nextLine();

        if (password.length() < 12) {
            System.out.println(
                    "Use a password with at least 12 characters."
            );
            return;
        }

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        System.out.println(
                "BCrypt hash: " + encoder.encode(password)
        );
    }
}