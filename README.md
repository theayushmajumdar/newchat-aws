# NewChat-AWS Deployment Documentation

## Overview

This project involves deploying a full-stack application on an AWS EC2 instance. It leverages **Nginx** as a reverse proxy for the Node.js backend and serves the static files from the frontend. It also covers setting up PM2 for process management and Docker for containerization.

## Prerequisites

Before you begin, make sure you have the following:
- An **AWS EC2 Instance** (preferably Ubuntu)
- **Node.js** and **Nginx** installed on the EC2 instance
- **Git** installed on the EC2 instance
- **PM2** installed for managing Node.js processes

## Steps for Deployment

### 1. Prepare the Application

Before setting up the server, ensure your project is ready for production:

1. **Build the Project**:

Run the following command to build the frontend for production:

```bash
npm run build
```

This will generate the production-ready build files for the frontend that will be served by Nginx.

**Set Backend Port**:

Make sure your backend server is configured to run on port 5000 as per your setup. Update the backend configuration if necessary.

### 2. Set Up the AWS EC2 Instance

**Create an EC2 Instance**:
- Launch a new EC2 instance with Ubuntu as the operating system
- Use the t2.micro instance type for basic setups
- Create and configure a new key pair for secure access

**Connect to EC2 Instance**:

Once the instance is running, connect to it via SSH:

```bash
ssh -i "your-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

**Install Dependencies**:

On your EC2 instance, install the required dependencies to run the project:

Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

Install Node.js:
```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

Install PM2 for process management:
```bash
sudo npm install pm2@latest -g
```

Clone the Git Repository and Install Dependencies:
```bash
git clone <your-repository-url>
cd newchat-aws
npm install
```

### 3. Configure the Backend and Frontend

**Frontend Configuration**:
- After building the frontend, place the static files in the appropriate directory for Nginx to serve
- For example, copy the build directory to `/var/www/html`

**Backend Configuration**:
- Configure your backend server to run on port 5000
- Ensure the server listens on all interfaces (0.0.0.0)

Use PM2 to start the backend server:
```bash
pm2 start server.js --name "newchat-backend"
```

### 4. Configure Nginx for Reverse Proxy

**Nginx Configuration**:

Edit the Nginx configuration to serve the application:
```bash
sudo nano /etc/nginx/sites-available/newchat-aws
```

Add the following configuration to proxy requests to your backend running on port 5000:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000; # Point to backend running on port 5000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Special location for Socket.IO (if applicable)
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable the Nginx Configuration**:

Create a symbolic link in the sites-enabled directory:
```bash
sudo ln -s /etc/nginx/sites-available/newchat-aws /etc/nginx/sites-enabled/
```

Test the Nginx configuration:
```bash
sudo nginx -t
```

Restart Nginx to apply the changes:
```bash
sudo systemctl restart nginx
```

### 5. Access the Application

After configuring Nginx, you can access your application by visiting the public IP of your EC2 instance (http://<EC2_PUBLIC_IP>).

### 6. For Secure Connection (Optional)

- Set up an SSL Certificate using Let's Encrypt or any other provider for securing your application over HTTPS
- You can use AWS Route 53 to set up a domain name for your application
- Update the Nginx configuration to use SSL for secure communication

### 7. Dockerize the Application (Optional)

Create a Dockerfile for your project to containerize it.

Build the Docker Image:
```bash
docker build -t newchat-aws .
```

Run the Docker Container:
```bash
docker run -d -p 5000:5000 newchat-aws
```

**Push the Docker Image to AWS ECR**:
- You can push the Docker image to AWS Elastic Container Registry (ECR) for more advanced deployment scenarios

### 8. Deploy with AWS ECS (Optional)

You can push your Docker image to AWS Elastic Container Registry (ECR) and then use Amazon ECS to deploy and run your application in a scalable manner with task definitions.

## Learning Curve

- **AWS Route 53**: You can host your application on a custom domain name using Route 53 and enable SSH for secure access
- **Multiple Application Hosting**: Learn to host multiple applications on a single EC2 instance using different domains by configuring Nginx accordingly
- **Containerization with Docker**: Dockerize the project and run it in AWS ECS to scale and manage your application more efficiently

## Conclusion

By following these steps, you'll have your full-stack application running on an AWS EC2 instance with Nginx, Node.js, and PM2 for production deployment. The optional steps will help you secure the connection, containerize the application, and scale it using AWS services like ECS and ECR.

**Happy coding and best of luck with your deployment!**
