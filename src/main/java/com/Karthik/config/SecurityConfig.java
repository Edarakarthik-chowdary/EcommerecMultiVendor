package com.Karthik.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public authentication endpoints
                        .requestMatchers(
                                "/auth/register",
                                "/auth/login",
                                "/auth/seller/register",
                                "/auth/seller/login",
                                "/error",
                                "/favicon.ico"
                        ).permitAll()

                        // Admin endpoints: administrators only
                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ROLE_ADMIN")

                        // Public brand browsing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/brands",
                                "/api/brands/**"
                        ).permitAll()

                        // Only administrators can create brands
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/brands",
                                "/api/brands/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Only administrators can update brands
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/brands/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Only administrators can delete brands
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/brands/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Public product browsing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products",
                                "/api/products/**"
                        ).permitAll()

                        // Only sellers can create products
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products"
                        ).hasAuthority("ROLE_SELLER")

                        // Only sellers can update products
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products/**"
                        ).hasAuthority("ROLE_SELLER")

                        // Only sellers can delete products
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products/**"
                        ).hasAuthority("ROLE_SELLER")

                        // All remaining endpoints require authentication
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}