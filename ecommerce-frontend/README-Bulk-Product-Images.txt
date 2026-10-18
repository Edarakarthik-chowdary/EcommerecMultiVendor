KARTHIK MART — BULK PRODUCT IMAGE HELPER

1. Start your Spring Boot backend.
2. Open PowerShell and run:
   cd E:\Intellij\ecommerce-frontend
3. Copy Download-KarthikMartImages.ps1 into that folder.
4. Run:
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\Download-KarthikMartImages.ps1

The script reads products from http://localhost:5454/api/products, searches Wikimedia Commons, and downloads candidate images into public\images. It creates image-attribution.csv (source and license information where available) and product-images.sql.

IMPORTANT
- These are candidate images, not guaranteed exact product photographs. Review the CSV and open the images before using them.
- Products without a filename-matching result are skipped.
- Verify license and attribution requirements before publishing.
- The SQL file is NOT executed automatically. Back up your database and review the SQL before running it. For each listed product, it deletes existing image rows for that product and inserts the local path.
- It expects database Ecommercevendor and table product_images(product_id, image_url).
- No ZIP file is created.
