# Tribelet
GitHub repo for the Tribelet web app. Will include a website where a user provides a prompt about their team and generates a team name, logo, short description, and then uses these to gain sponsorship and make custom kit orders.

## Adding to Docker + Pushing to AWS ECR:

Use the following pattern to add your updates to Docker and AWS ECR:

docker build --platform linux/amd64 -t tribelet-backend:latest .

docker tag tribelet-backend:latest {AWS number}.dkr.ecr.{AWS region}.amazonaws.com/tribelet-backend:latest

docker push {AWS number}.dkr.ecr.{AWS region}.amazonaws.com/tribelet-backend:latest
