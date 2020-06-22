output "product_id" {
  value       = "${azurerm_api_management_product.product.product_id}"
  description = "ID of the product"
}

# this variable will be accessible to tests as API_GATEWAY_URL environment variable
output "api_gateway_url" {
  value = "https://core-api-mgmt-${var.env}.azure-api.net/${local.api_base_path}"
}
