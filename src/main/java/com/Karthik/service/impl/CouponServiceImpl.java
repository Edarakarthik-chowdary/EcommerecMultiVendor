package com.Karthik.service.impl;

import com.Karthik.model.Coupon;
import com.Karthik.repository.CouponRepository;
import com.Karthik.service.CouponService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    public CouponServiceImpl(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Override
    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found: " + code));
    }

    @Override
    public Coupon updateCoupon(Long id, Coupon coupon) {
        Coupon existing = getCouponById(id);

        // Replace these example field names with your actual Coupon fields.
        // Example: existing.setCode(coupon.getCode());

        return couponRepository.save(existing);
    }

    @Override
    public void deleteCoupon(Long id) {
        Coupon existing = getCouponById(id);
        couponRepository.delete(existing);
    }
}