terraform {
  backend "local" {
    path = ".state/local.tfstate"
  }
}
