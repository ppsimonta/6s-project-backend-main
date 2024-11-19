# 6S Audit web app back-end

This repository contains the backend services for a system that allows conducting various types of audits on different rooms. The backend is built using **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

## Features

- **User Authentication**: Users can register, log in, and manage their accounts.
- **Audit Management**: Create, retrieve, update, and delete audit records for room inspections.
- **Question Management**: Manage audit questions linked to audits.
- **Room Management**: Manage rooms that can be inspected during audits.

## Backend Overview

### **User Service**:
Handles user registration, authentication, password management, and user role management.
- **Registration**: Users can register with an email and password, receive a verification email, and be assigned a role (`user`, `operator`, `admin`).
- **Login**: Users can log in, and the backend generates a JWT token for authentication.
- **Profile & Role Management**: Users can update their profiles, change usernames, and manage roles.
- **Password Reset**: Users can reset their password via a token sent to their email.

### **Audit Service**:
Manages audit records linked to rooms and users.
- **Create Audits**: Audits are created based on a set of questions and are linked to a specific room and user.
- **Get Audits**: Retrieve specific audits or all audits, including related data like room and user information.
- **Update Audit**: Approve or modify an audit.
- **Delete Audit**: Audits can be deleted based on their ID.

### **Room Service**:
Manages rooms that can be audited.
- **Get Rooms**: Fetch all rooms or filter rooms by location.
- **Create Room**: Add new rooms to the system.

### **Question Service**:
Manages the questions used during audits.
- **Add Questions**: Save a set of audit questions to the database.
- **Delete Questions**: Remove questions by their ID.

## Tech Stack
- **Node.js** for the backend framework.
- **Express** for routing and middleware handling.
- **MongoDB** for the database.
- **Mongoose** for MongoDB object modeling.
- **JWT** for user authentication.
- **SendGrid** for sending verification and password reset emails.

## Installation

Prerequisites:

- Git
- NodeJS
- MongoDB

Other types of databases can be supported by adding a new set of services, however no environment variables nor services are provided at this time.

```sh
cd 6s-project-backend
npm install
```

Remember to rename the `.env.example` file to `.env` and fill in the values.

## Running the app

Once installed you can run the server.
```sh
npm start
```
