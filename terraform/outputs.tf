output "k3s_public_ip" {
  value = aws_instance.k3s.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/showroom-key ec2-user@${aws_instance.k3s.public_ip}"
}

output "app_url" {
  value = "http://${aws_instance.k3s.public_ip}:30080"
}

output "ecr_repositories" {
  value = { for name, repo in aws_ecr_repository.repos : name => repo.repository_url }
}