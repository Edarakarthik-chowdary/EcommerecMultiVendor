package com.Karthik.service;

import com.Karthik.model.Brand;

import java.util.List;

public interface BrandService {

    Brand createBrand(Brand brand);

    List<Brand> getAllBrands();

    Brand getBrandById(Long id);

    Brand updateBrand(Long id, Brand brand);

    void deleteBrand(Long id);
}