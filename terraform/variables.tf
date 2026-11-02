variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "project" {
  type    = string
  default = "showroom"
}

variable "my_ip_cidr" {
  type        = string
  description = "Your public IP with /32, allowed to use SSH and the Kubernetes API"
}

variable "k3s_instance_type" {
  type    = string
  default = "t3.small"
}

variable "public_key_path" {
  type    = string
  default = "~/.ssh/showroom-key.pub"
}