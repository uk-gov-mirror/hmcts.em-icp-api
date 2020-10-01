variable "product" {}

variable "component" {}

variable "location" {
  default = "UK South"
}

variable "env" {}

variable "common_tags" {
  type = map(string)
}

variable "tenant_id" {}

variable "jenkins_AAD_objectId" {
  description = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "subscription" {}

variable "managed_identity_object_id" {
  default = ""
}

variable "appinsights_location" {
  default     = "West Europe"
  description = "Location for Application Insights"
}

# thumbprint of the SSL certificate for API gateway tests
variable api_gateway_test_certificate_thumbprint {
  # keeping this empty by default, so that no thumbprint will match
  default = ""
}
