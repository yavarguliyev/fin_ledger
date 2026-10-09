resource "aws_default_security_group" "locked" {
  vpc_id = aws_vpc.main.id
}

resource "aws_security_group" "load_balancer" {
  name        = "${var.name_prefix}-load-balancer"
  description = "Public HTTPS entry in front of the API"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "app" {
  name        = "${var.name_prefix}-app"
  description = "API and worker tasks"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "data" {
  name        = "${var.name_prefix}-data"
  description = "PostgreSQL and Redis"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "endpoints" {
  name        = "${var.name_prefix}-endpoints"
  description = "Interface VPC endpoints for AWS services"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer_https" {
  security_group_id = aws_security_group.load_balancer.id
  description       = "HTTPS from the internet"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_security_group_rule" "load_balancer_to_app" {
  type                     = "egress"
  security_group_id        = aws_security_group.load_balancer.id
  description              = "Forward to the API"
  source_security_group_id = aws_security_group.app.id
  protocol                 = "tcp"
  from_port                = var.app_port
  to_port                  = var.app_port
}

resource "aws_security_group_rule" "app_from_load_balancer" {
  type                     = "ingress"
  security_group_id        = aws_security_group.app.id
  description              = "API traffic from the load balancer only"
  source_security_group_id = aws_security_group.load_balancer.id
  protocol                 = "tcp"
  from_port                = var.app_port
  to_port                  = var.app_port
}

resource "aws_security_group_rule" "app_to_data" {
  for_each = toset([for port in var.data_ports : tostring(port)])

  type                     = "egress"
  security_group_id        = aws_security_group.app.id
  description              = "Databases on port ${each.value}"
  source_security_group_id = aws_security_group.data.id
  protocol                 = "tcp"
  from_port                = tonumber(each.value)
  to_port                  = tonumber(each.value)
}

resource "aws_security_group_rule" "app_to_endpoints" {
  type                     = "egress"
  security_group_id        = aws_security_group.app.id
  description              = "AWS services through the VPC endpoints"
  source_security_group_id = aws_security_group.endpoints.id
  protocol                 = "tcp"
  from_port                = 443
  to_port                  = 443
}

resource "aws_vpc_security_group_egress_rule" "app_to_providers" {
  for_each = toset(var.provider_egress_cidrs)

  security_group_id = aws_security_group.app.id
  description       = "Payment provider HTTPS through the NAT gateway"
  cidr_ipv4         = each.value
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_security_group_rule" "data_from_app" {
  for_each = toset([for port in var.data_ports : tostring(port)])

  type                     = "ingress"
  security_group_id        = aws_security_group.data.id
  description              = "Port ${each.value} from the app only"
  source_security_group_id = aws_security_group.app.id
  protocol                 = "tcp"
  from_port                = tonumber(each.value)
  to_port                  = tonumber(each.value)
}

resource "aws_security_group_rule" "endpoints_from_app" {
  type                     = "ingress"
  security_group_id        = aws_security_group.endpoints.id
  description              = "HTTPS from the app only"
  source_security_group_id = aws_security_group.app.id
  protocol                 = "tcp"
  from_port                = 443
  to_port                  = 443
}
