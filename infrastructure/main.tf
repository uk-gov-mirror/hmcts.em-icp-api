provider "azurerm" {
  version = "1.44.0"
}

locals {
  app_full_name = "${var.product}-${var.component}"
  local_env           = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  s2s_key             = "${data.azurerm_key_vault_secret.s2s_key.value}"
  #region API gateway
  thumbprints_in_quotes = "${formatlist("&quot;%s&quot;", var.icp_api_gateway_certificate_thumbprints)}"
  thumbprints_in_quotes_str = "${join(",", local.thumbprints_in_quotes)}"
  api_policy = "${replace(file("template/api-policy.xml"), "ALLOWED_CERTIFICATE_THUMBPRINTS", local.thumbprints_in_quotes_str)}"
  api_base_path = "bulk-scanning-payment"
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
  name         = "microservicekey-em-icp"
  key_vault_id = "${data.azurerm_key_vault.s2s_vault.id}"
}

resource "azurerm_key_vault_secret" "local_s2s_key" {
  name         = "microservicekey-em-icp"
  value        = "${data.azurerm_key_vault_secret.s2s_key.value}"
  key_vault_id = "${module.local_key_vault.key_vault_id}"
}

# Load AppInsights key from rpa vault
data "azurerm_key_vault" "rpa_vault" {
  name                = "rpa-${local.local_env}"
  resource_group_name = "rpa-${local.local_env}"
}


data "azurerm_key_vault_secret" "app_insights_key" {
  name      = "AppInsightsInstrumentationKey"
  key_vault_id = "${data.azurerm_key_vault.rpa_vault.id}"
}

resource "azurerm_key_vault_secret" "local_app_insights_key" {
  name         = "AppInsightsInstrumentationKey"
  value        = "${data.azurerm_key_vault_secret.app_insights_key.value}"
  key_vault_id = "${module.local_key_vault.key_vault_id}"
}



#Redis
data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name = "core-infra-${var.env}"
}

module "em-icp-redis-cache" {
  source   = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product  = "${var.product}-${var.component}-redis-cache"
  location = "${var.location}"
  env      = "${var.env}"
  subnetid = "${data.azurerm_subnet.core_infra_redis_subnet.id}"
  common_tags  = "${var.common_tags}"
}

#data "azurerm_key_vault_secret" "redis_password" {
#  name      = "redis-password"
#  key_vault_id = "${data.azurerm_key_vault.rpa_vault.id}"
#}

#resource "azurerm_key_vault_secret" "local_redis_password" {
#  name         = "redis-password"
#  value        = "${data.azurerm_key_vault_secret.redis_password.value}"
#  key_vault_id = "${module.local_key_vault.key_vault_id}"
#}

resource "azurerm_key_vault_secret" "local_redis_password" {
  name = "redis-password"
  value = "${module.em-icp-redis-cache.access_key}"
  key_vault_id = "${module.local_key_vault.key_vault_id}"
}


data "template_file" "api_template" {
  template = "${file("${path.module}/template/api.json")}"
}

data "template_file" "policy_template" {
  template = "${file("${path.module}/template/api-policy.xml")}"

  vars {
    allowed_certificate_thumbprints = "${local.thumbprints_in_quotes_str}"
    s2s_client_id = "${data.azurerm_key_vault_secret.s2s_key.value}"
    s2s_client_secret = "${data.azurerm_key_vault_secret.s2s_key.value}"
#    s2s_base_url = "${local.s2sUrl}"
  }
}

resource "azurerm_template_deployment" "icp-api" {
  template_body       = "${data.template_file.api_template.rendered}"
  name                = "icp-api-${var.env}"
  deployment_mode     = "Incremental"
  resource_group_name = "core-infra-${var.env}"
  count               = "${var.env != "preview" ? 1: 0}"

  parameters = {
    apiManagementServiceName  = "core-api-mgmt-${var.env}"
    apiName                   = "icp-api"
    apiProductName            = "icp"
    serviceUrl                = "http://icp-api-${var.env}.service.core-compute-${var.env}.internal"
    apiBasePath               = "${local.api_base_path}"
    policy                    = "${data.template_file.policy_template.rendered}"
  }
}
