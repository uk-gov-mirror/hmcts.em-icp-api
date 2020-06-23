variable "product" {
  type = "string"
}

variable "component" {
  type = "string"
}

variable "location" {
  type    = "string"
  default = "UK South"
}

variable "env" {
  type = "string"
}

variable "common_tags" {
  type = "map"
}

variable "tenant_id" {}

variable "jenkins_AAD_objectId" {
  type        = "string"
  description = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "subscription" {
  type = "string"
}

variable "managed_identity_object_id" {
  default = ""
}

variable "appinsights_location" {
  type        = "string"
  default     = "West Europe"
  description = "Location for Application Insights"
}

variable "api_mgmt_rg" {
  description = "Resource group that api management is in, e.g. core-infra-demo"
}

variable "name" {
  description = "Name of the product"
}

variable "subscription_required" {
  default     = true
  description = "Is a Subscription required to access API's included in this Product?"
}

variable "subscriptions_limit" {
  default     = 20
  description = "The number of subscriptions a user can have to this Product at the same time"
}

variable "approval_required" {
  default     = true
  description = "Do subscribers need to be approved prior to being able to use the Product?"
}

variable "published" {
  default     = true
  description = "If the product should be published"
}
# thumbprint of the SSL certificate for API gateway tests
variable api_gateway_test_certificate_thumbprint {
  type = "string"

  # keeping this empty by default, so that no thumbprint will match
  default = ""
}
