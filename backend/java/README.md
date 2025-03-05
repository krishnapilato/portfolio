# Spring Boot Backend

This project serves as the backend for my portfolio website. It provides a robust and scalable RESTful API, built with **Spring Boot**, to handle features such as user authentication, data management, and more. The backend is designed to be both secure and efficient, providing a seamless experience for users interacting with the website.

## Features

- **User Authentication**: Secure login and registration functionality using JWT (JSON Web Tokens) for authentication.
- **Data Management**: Manage user profiles, portfolio items, and other data using RESTful endpoints.
- **Database Integration**: MySQL database support for persistent storage with Spring Data JPA.
- **Security**: The application uses **Spring Security** to protect sensitive endpoints and ensure authorized access.
- **API Documentation**: Built-in Swagger UI for easy interaction with the API.
- **Error Handling**: Custom error messages and status codes for better API responses.

## Getting Started

Follow these steps to set up the backend locally on your machine:

### 1. Prerequisites

Make sure you have the following tools installed on your local machine:

- **Java JDK 23**: Required to build and run the Spring Boot application.
- **Maven**: A build automation tool to manage dependencies and build the project.
- **MySQL Database**: A relational database to store user data and portfolio content.
- **IDE**: Integrated Development Environment (IDE) like **IntelliJ IDEA**.
- **Postman/Swagger UI**: For testing the API endpoints.

### 2. Configuration

Before running the application, you need to configure the database and environment settings:

1. **Database Configuration**:
    - Make sure you have a running instance of **MySQL**.
    - Create a database for the backend (e.g., `portfolio_backend`).
    - Update the `application.properties` file located in the `src/main/resources` directory with your database credentials:

    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/portfolio_backend?useSSL=false&serverTimezone=UTC
    spring.datasource.username=your_mysql_username
    spring.datasource.password=your_mysql_password
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.properties.hibernate.format_sql=true
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    ```

2. **Application Properties**:
    - Update the `application.properties` file to reflect your application-specific settings such as JWT secret, authentication options, and logging level:

    ```properties
    # JWT Configuration
    jwt.secret=your_jwt_secret_key
    jwt.expiration=3600
    
    # Logging
    logging.level.org.springframework.web=DEBUG
    logging.level.com.yourapp=INFO
    ```

### 3. Clone & Run

Once your prerequisites and configurations are ready, follow these steps to run the project:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/krishnapilato/portfolio.git
    ```

2. **Navigate to the backend directory**:
    ```bash
    cd backend/java
    ```

3. **Build and run the Spring Boot application**:
    - You can use **Maven** to run the application using the following command:

    ```bash
    ./mvnw spring-boot:run
    ```

    - Alternatively, if you're using an IDE, simply import the project and run the `Application.java` class as a Spring Boot application.

Your backend API should now be accessible at `http://localhost:8080`.

### 4. Testing the API

You can test the RESTful endpoints using **Postman** or **Swagger UI** (enabled by default for easy exploration of API).

- **Swagger UI**: After running the application, visit `http://localhost:8080/swagger-ui.html` to interact with the API directly.
- **Postman**: Test API endpoints such as login (`POST /api/auth/login`), user registration (`POST /api/auth/register`), and other data management endpoints like `/api/portfolio` and `/api/users`.

## Technologies Used

This project incorporates several technologies that are popular in the Java ecosystem. Below are the key technologies used in the backend:

- **Java**: The primary language used to develop the backend service.
- **Spring Boot**: The framework chosen to simplify and accelerate the development of the backend.
- **Spring Security**: A comprehensive security framework for securing the API with authentication and authorization features.
- **Spring Data JPA**: Provides easy-to-use data access features and ORM (Object-Relational Mapping) integration with MySQL.
- **Hibernate ORM**: Facilitates seamless interaction between Java objects and the MySQL database.
- **JWT (JSON Web Tokens)**: A compact, URL-safe means of representing claims between two parties.
- **MySQL**: The relational database used for storing application data.
- **Maven**: A build automation tool used to manage project dependencies.
- **Swagger**: A tool for documenting and testing the API directly from the browser.

## Deployment

When ready for deployment, the backend can be packaged as a **JAR** or **WAR** file and deployed on cloud services such as **AWS**, **Heroku**, or any platform supporting Java-based applications.

- To build the project as a JAR file:
    ```bash
    ./mvnw clean package
    ```

- The resulting JAR file can be found in the `target` directory and can be run with:
    ```bash
    java -jar target/portfolio-backend.jar
    ```

## Need Help?

If you encounter any issues, feel free to reach out:

- **GitHub Issues**: Open an issue in the [GitHub repository](https://github.com/krishnapilato/kodek/issues).
- **LinkedIn**: Connect with me on [LinkedIn](https://www.linkedin.com/in/khovakrishnapilato).

## Contributing

Contributions are welcome! Feel free to fork the repository, create a feature branch, and submit a pull request. Please ensure that your code follows the established coding style and includes appropriate tests.

---

Thank you for checking out this project! Enjoy building with Spring Boot!