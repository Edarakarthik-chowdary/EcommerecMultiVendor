package com.Karthik.service;

import com.Karthik.model.Coupon;

import java.util.List;

public interface CouponService {

    Coupon createCoupon(Coupon coupon);

    Coupon getCouponById(Long id);

    List<Coupon> getAllCoupons();

    Coupon getCouponByCode(String code);

    Coupon updateCoupon(Long id, Coupon coupon);

    void deleteCoupon(Long id);
}