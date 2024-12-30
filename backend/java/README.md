# Spring Boot Backend

This project serves as the backend for my portfolio website, providing a robust RESTful API built with Spring Boot. It supports features like user authentication, data management, and more.

## Getting Started

Follow these steps to get the backend up and running locally:

### 1. Prerequisites:

Ensure you have the following tools installed:

- Java JDK 23
- Maven (for managing project dependencies)
- MySQL Database
- IDE of your choice (Eclipse, IntelliJ IDEA, etc.)

### 2. Configuration:

Before running the application, configure the database connections:

- Open the `application.properties` file located in the `src/main/resources` folder.
- Update the following properties with your database credentials:
    - `spring.datasource.username`: Your MySQL username
    - `spring.datasource.password`: Your MySQL password

### 3. Clone & Run:

1. Clone the repository:
    ```bash
    git clone https://github.com/krishnapilato/portfolio.git
    ```

2. Navigate to the backend directory:
    ```bash
    cd backend/java
    ```

3. Start the Spring Boot application:
    ```bash
    ./mvnw spring-boot:run
    ```

Your backend API should now be running at `http://localhost:8080`.

## Technologies Used

- **Java**: The primary language for backend development.
- **Spring Boot**: The framework that simplifies building Java web applications.
- **Spring Security**: Provides authentication and authorization to secure the API.
- **Spring Data JPA**: Simplifies database operations with JPA.
- **Hibernate**: The ORM framework that facilitates interaction between Java objects and MySQL database.
- **JWT (JSON Web Tokens)**: Used for secure user authentication.

## Need Help?

If you run into any issues or have questions, feel free to reach out. You can create an issue on GitHub or connect with me on LinkedIn.