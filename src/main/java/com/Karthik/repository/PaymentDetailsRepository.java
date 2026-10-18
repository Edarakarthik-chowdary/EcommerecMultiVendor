package com.Karthik.repository;

import com.Karthik.model.PaymentDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentDetailsRepository
        extends JpaRepository<PaymentDetails, Long> {
}