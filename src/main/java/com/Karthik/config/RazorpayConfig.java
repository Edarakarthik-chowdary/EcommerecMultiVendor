package com.Karthik.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("rzp_test_To8Evmg0hqt0GI")
    private String keyId;

    @Value("oyj1Q78EE7mGbmtJCHTG2M3x")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId == null || keyId.isBlank()
                || keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException(
                    "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
        }
        return new RazorpayClient(keyId, keySecret);
    }
}
