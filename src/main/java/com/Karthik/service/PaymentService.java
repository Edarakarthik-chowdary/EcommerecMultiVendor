package com.Karthik.service;

import com.Karthik.model.PaymentDetails;

public interface PaymentService {
    PaymentDetails createPayment(Long orderId);
    PaymentDetails getPaymentById(Long paymentId);
    PaymentDetails getPaymentByOrderId(Long orderId);
    PaymentDetails verifyPayment(Long orderId, String razorpayOrderId,
                                 String razorpayPaymentId, String razorpaySignature);
}
