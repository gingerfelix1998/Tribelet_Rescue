
# 📘 Deploying Tribelet to AWS with ECS Fargate

## 📁 Index
- [1. Architecture Overview](#1-architecture-overview)
- [2. Dockerization](#2-dockerization)
- [3. Pushing to ECR](#3-pushing-to-ecr)
- [4. VPC & Networking](#4-vpc--networking)
- [5. ECS & Fargate Services](#5-ecs--fargate-services)
- [6. Load Balancer Routing](#6-load-balancer-routing)
- [7. Secrets Management](#7-secrets-management)
- [8. Debugging & Health Checks](#8-debugging--health-checks)
- [9. Final Verification](#9-final-verification)

---

## 1. Architecture Overview

**Architecture Summary:**
- Frontend: React app served by Nginx (public via ALB)
- Backend: FastAPI service (private, accessed only via ALB `/api/*`)
- Load balancing: Application Load Balancer (ALB) with routing rules
- Secrets stored in AWS Secrets Manager
- Containers deployed on AWS ECS (Fargate)

**Diagram:**
```
[ Client Browser ]
        |
     [ ALB ]
     /    \
 [ /api/* ]----> backend-service (private, port 8000)
 [  /*    ]----> frontend-service (public, Nginx)
```

---

## 2. Dockerization

### Frontend

```dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
```

```bash
docker build --platform linux/amd64 -t tribelet-frontend .
```

### Backend

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build --platform linux/amd64 -t tribelet-backend .
```

---

## 3. Pushing to ECR

```bash
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 786169356406.dkr.ecr.eu-west-2.amazonaws.com

# Frontend
docker tag tribelet-frontend 786169356406.dkr.ecr.eu-west-2.amazonaws.com/tribelet-frontend
docker push 786169356406.dkr.ecr.eu-west-2.amazonaws.com/tribelet-frontend

# Backend
docker tag tribelet-backend 786169356406.dkr.ecr.eu-west-2.amazonaws.com/tribelet-backend
docker push 786169356406.dkr.ecr.eu-west-2.amazonaws.com/tribelet-backend
```

---

## 4. VPC & Networking

- 2 Public subnets (ALB)
- 2 Private subnets (Fargate)
- Internet Gateway
- Route Tables

**Security Groups:**
- ALB: allow port 80 from anywhere
- Backend: allow port 8000 from ALB

---

## 5. ECS & Fargate Services

### Task Definitions

**Frontend:**
- Port: 80
- Env var: `REACT_APP_API_URL=/api`

**Backend:**
- Port: 8000
- Env vars via Secrets Manager

### Services

- Frontend: Public, attached to ALB
- Backend: Private, attached to ALB (`/api/*`)

---

## 6. Load Balancer Routing

| Priority | Condition     | Target Group |
|----------|---------------|--------------|
| 1        | Path: `/api/*`| backend-tg   |
| Default  | Path: `/*`    | frontend-tg  |

---

## 7. Secrets Management

Use AWS Secrets Manager to store sensitive values.

### IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": [
        "arn:aws:s3:::tribelet-prompts",
        "arn:aws:s3:::tribelet-prompts/*"
      ]
    }
  ]
}
```

---

## 8. Debugging & Health Checks

**ALB Health Check Settings:**
- Path: `/login`
- Port: 8000
- Success codes: `200`

### Common Errors
- 503 → backend not registered to target group
- 403 → Docker push unauthorized
- 404 → Backend route not prefixed with `/api`

---

## 9. Final Verification

Test on:

```
http://frontend-alb-XXXXXXXX.eu-west-2.elb.amazonaws.com
```

✅ Login  
✅ Team creation  
✅ Image uploads  
✅ Public accessibility

---

## ✅ Next Steps

- [ ] HTTPS setup via ACM
- [ ] Custom domain via Route 53
- [ ] GitHub Actions CI/CD
