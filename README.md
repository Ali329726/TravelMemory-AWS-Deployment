# TravelMemory – AWS Deployment

## Project Overview

TravelMemory is a travel-related web application with a frontend and backend. As part of this project, I have been working on deploying the application on AWS and connecting its different components.

The project focuses on EC2 instances, Application Load Balancers, Nginx reverse-proxy configuration, frontend-to-backend communication, and custom-domain DNS configuration.

## Technologies Used

- React and JavaScript
- Node.js and Express.js
- MongoDB
- Amazon Web Services (AWS)
- Amazon EC2
- Application Load Balancer (ALB)
- Nginx
- Hostinger
- Cloudflare DNS
- Git and GitHub

## Project Structure

```text
TravelMemory-Working/
├── frontend/
├── backend/
├── screenshots/
└── README.md
```

## AWS Deployment

The project uses separate frontend and backend load balancers to route traffic to the appropriate application tier.

### Frontend Load Balancer

The frontend load balancer receives incoming web requests and forwards them to its registered targets.

**AWS Region:** US East (N. Virginia), `us-east-1`

**DNS name:**

`travelmemory-frontend-alb-1898049836.us-east-1.elb.amazonaws.com`

### Backend Load Balancer

The backend load balancer provides an endpoint for backend API requests and forwards traffic to its registered targets.

**AWS Region:** US East (N. Virginia), `us-east-1`

**DNS name:**

`travelmemory-backendend-alb-1512209659.us-east-1.elb.amazonaws.com`

These are the load balancer DNS names supplied for this project. Their current availability and target health should be verified in AWS.

## Application Architecture

The intended architecture separates frontend traffic from backend API traffic.

```text
                         Users
                           |
                      Custom Domain
                           |
                     Cloudflare DNS
                           |
                Frontend Application ALB
                           |
                  Frontend EC2 Instances
                           |
                     Frontend API Calls
                           |
                 Backend Application ALB
                           |
                   Backend EC2 Instances
                           |
                    Nginx / Node.js API
                           |
                       MongoDB
```

The final architecture diagram should reflect the actual deployment, including where Nginx is configured and how the backend connects to the database.

## Nginx Configuration

Nginx is used as a reverse proxy where configured. It helps route incoming requests to the appropriate application service.

The Nginx configuration should be checked to confirm that requests are forwarded to the correct backend service and port.

## Frontend and Backend Integration

The frontend must use the correct backend API endpoint. The frontend URL configuration, including `frontend/src/urls.js` if present, should point to the deployed backend endpoint.

The integration should be tested by opening the frontend and checking that API requests receive successful responses from the backend.

## DNS and Custom Domain

The domain was purchased through Hostinger. Cloudflare is intended to manage DNS after the domain's nameservers are configured.

The planned configuration is:

1. Add the domain to Cloudflare.
2. Update the domain's nameservers in Hostinger.
3. Create DNS records for the frontend.
4. Configure a separate API subdomain if required.
5. Point the relevant DNS records to the AWS load balancers.
6. Configure HTTPS and verify domain connectivity.

### Example DNS Records

| Type  | Name  | Target                |
| ----- | ----- | --------------------- |
| CNAME | `www` | Frontend ALB DNS name |
| CNAME | `api` | Backend ALB DNS name  |

These are example records. The actual domain and DNS targets must match the configured deployment. Root-domain DNS may require Cloudflare's supported apex-domain handling.

## Running the Application Locally

### Backend

```bash
cd backend
npm install
npm start
```

Configure the required environment variables before starting the backend. Use the start command specified in `backend/package.json`.

### Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite and verify that the frontend can communicate with the backend.

## Screenshots and Documentation

The `screenshots/` directory contains screenshots collected for the project.

The project documentation should include available screenshots of:

- Frontend application pages
- EC2 instances
- Frontend and backend load balancers
- Target-group health status
- Nginx configuration
- Frontend API URL configuration
- Hostinger domain and Cloudflare DNS settings
- Application access through the custom domain

## Architecture Diagram

Include a separate draw.io diagram showing the custom domain, Cloudflare DNS, both load balancers, frontend and backend EC2 instances, Nginx, and database connectivity.

The diagram should match the actual AWS configuration.

## Security

- Do not upload `.env` files or API keys.
- Do not commit passwords or database credentials.
- Do not upload private SSH keys or `.pem` files.
- Exclude `node_modules/` and generated build folders from Git.
- Keep sensitive configuration in environment variables.

## Testing

Before considering the deployment complete, verify:

- The frontend loads successfully.
- The backend API responds correctly.
- Frontend requests reach the backend.
- The expected load-balancer targets are healthy.
- Nginx routing works where configured.
- DNS records resolve to the intended destinations.
- The custom domain works over HTTPS.

## Author

**Shaik Mohammad Ali**

MCA Graduate | Aspiring DevOps Engineer

**GitHub Profile:** [Ali329726](https://github.com/Ali329726)

**Project Repository:** Add the public TravelMemory repository URL after pushing the project.

## Project Status

This README documents the project structure and deployment configuration. Each deployment requirement should be marked as completed only after it has been configured and tested.
