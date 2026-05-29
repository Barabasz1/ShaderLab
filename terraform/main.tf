terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = ">= 4.0.0"
    }
  }
}

variable "keycloak_url" {
  default = "http://localhost:8080"
}

provider "keycloak" {
  client_id = "admin-cli"
  url       = var.keycloak_url
  username = "admin"
  password = "admin"
}

resource "keycloak_realm" "shaderlab_realm" {
  realm                = "shaderlab"
  enabled              = true
  registration_allowed = true
}

resource "keycloak_openid_client" "shaderlab_client" {
  realm_id              = keycloak_realm.shaderlab_realm.id
  client_id             = "shaderlab_client"
  enabled               = true
  access_type           = "PUBLIC"
  standard_flow_enabled = true

  valid_redirect_uris = [
    "http://localhost:5173/*"
  ]

  web_origins = [
    "http://localhost:5173",
    "+"
  ]
}