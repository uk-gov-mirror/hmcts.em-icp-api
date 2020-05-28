provider "azurerm" {
  version = "1.44.0"
}

locals {
  app_full_name = "${var.product}-${var.component}"
  local_env           = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  s2s_key             = "${data.azurerm_key_vault_secret.s2s_key.value}"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = "${var.location}"

  tags = "${var.common_tags}"
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${var.product}-${var.component}-appinsights-${var.env}"
  location            = "${var.appinsights_location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  application_type    = "Web"

  tags = "${var.common_tags}"
}

module "local_key_vault" {
  source                     = "git@github.com:hmcts/cnp-module-key-vault?ref=master"
  product                    = "${local.app_full_name}"
  env                        = "${var.env}"
  tenant_id                  = "${var.tenant_id}"
  object_id                  = "${var.jenkins_AAD_objectId}"
  resource_group_name        = "${azurerm_resource_group.rg.name}"
  product_group_object_id    = "5d9cd025-a293-4b97-a0e5-6f43efce02c0"
  common_tags                = "${var.common_tags}"
  managed_identity_object_id = "${var.managed_identity_object_id}"
}

data "azurerm_key_vault" "s2s_vault" {
  name                = "s2s-${local.local_env}"
  resource_group_name = "rpe-service-auth-provider-${local.local_env}"
}

data "azurerm_key_vault_secret" "s2s_key" {
  name         = "microservicekey-em-ccd-orchestrator"
  key_vault_id = "${data.azurerm_key_vault.s2s_vault.id}"
}

resource "azurerm_key_vault_secret" "local_s2s_key" {
  name         = "microservicekey-em-ccd-orchestrator"
  value        = "${data.azurerm_key_vault_secret.s2s_key.value}"
  key_vault_id = "${module.local_key_vault.key_vault_id}"
}
