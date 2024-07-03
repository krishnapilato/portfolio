# My Spring Boot Project

[![LinkedIn Badge](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/khovakrishnapilato)

This is a RESTful API built with Spring Boot, providing user authentication, management, and other functionalities.

## Technologies Used

* **Java:** The primary programming language for the backend.
* **Spring Boot:** Framework for building production-ready Spring applications.
* **Spring Security:** Framework for authentication and authorization.
* **Spring Data JPA:** Simplifies database access with JPA.
* **Hibernate:** Object-relational mapping (ORM) framework for Java.
* **JWT (JSON Web Token):** For secure user authentication and authorization.
* **Database:** MySQL

## Getting Started

1. **Prerequisites:**
   * Java JDK (21)
   * Maven
   * MySQL Database
   * Eclipse IDE / IntelliJ IDEA

2. **Configuration:**
   * Open the `application.properties` file and update the following configurations:
      * `spring.datasource.username`: Your database username
      * `spring.datasource.password`: Your database password

3. **Clone and Run:**

   ```bash
   git clone https://github.com/krishnapilato/portfolio.git
   cd backend/java
   ./mvnw spring-boot:run