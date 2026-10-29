# HƯỚNG DẪN CÀI ĐẶT MÔI TRƯỜNG MÁY CHỦ (INSTALLATION GUIDE)

1. YÊU CẦU PHẦN CỨNG VÀ HỆ ĐIỀU HÀNH
• Hệ điều hành khuyến nghị: Ubuntu Server 22.04 LTS / Debian 12 / Windows Server 2022.
• Cấu hình phần cứng tối thiểu: 4 CPU Cores, 8GB RAM, 50GB SSD Storage.
• Cấu hình khuyến nghị (Production): 8 CPU Cores, 16GB RAM, 100GB NVMe SSD.

2. CÀI ĐẶT CÁC CÔNG CỤ NỀN TẢNG
• Bước 1: Cập nhật danh mục gói hệ thống:
  sudo apt update && sudo apt upgrade -y

• Bước 2: Cài đặt Docker Engine & Docker Compose Plugin:
  sudo apt install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

• Bước 3: Cấu hình quyền chạy Docker cho User:
  sudo usermod -aG docker $USER
  newgrp docker

• Bước 4: Kiểm tra phiên bản cài đặt thành công:
  docker --version
  docker compose version