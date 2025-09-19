terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "public_ssh_key" {
  description = "Public SSH key for droplet access"
  type        = string
}

variable "agent_domain" {
  description = "Domain for the agent"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "super-agent"
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
}

variable "create_domain" {
  description = "Whether to create DNS A record"
  type        = bool
  default     = false
}

provider "digitalocean" {
  token = var.do_token
}

# SSH Key
resource "digitalocean_ssh_key" "main" {
  name       = "${var.project_name}-ssh-key"
  public_key = var.public_ssh_key
}

# Droplet
resource "digitalocean_droplet" "main" {
  image    = "docker-20-04"
  name     = var.project_name
  region   = var.region
  size     = "s-2vcpu-4gb"
  ssh_keys = [digitalocean_ssh_key.main.fingerprint]

  user_data = templatefile("${path.module}/user-data.sh", {
    project_name = var.project_name
    agent_domain = var.agent_domain
  })
}

# Domain record
resource "digitalocean_record" "main" {
  count    = var.create_domain ? 1 : 0
  domain   = var.agent_domain
  type     = "A"
  name     = "@"
  value    = digitalocean_droplet.main.ipv4_address
  ttl      = 300
}

# Firewall
resource "digitalocean_firewall" "main" {
  name = "${var.project_name}-firewall"

  droplet_ids = [digitalocean_droplet.main.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# Outputs
output "droplet_ip" {
  value = digitalocean_droplet.main.ipv4_address
}

output "ssh_command" {
  value = "ssh root@${digitalocean_droplet.main.ipv4_address}"
}