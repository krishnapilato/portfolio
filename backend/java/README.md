# Spring Boot Backend 💼

This project is the backend for my portfolio website. It provides a RESTful API built with Spring Boot that handles user authentication, data management, and more.

## 🚀 Get Started

Here's how you can get this backend up and running:

1. **Prerequisites:**
   - Make sure you have the following tools installed on your machine:
      - Java JDK 21 ☕
      - Maven (for managing project dependencies) 
      - MySQL Database 💾
      - MongoDB Database
      - Your favorite IDE (Eclipse, IntelliJ IDEA, etc.) 💻

2. **Configuration:**
   - Open the `application.properties` file in your project.  
   - Update the following lines with your database credentials:
      - `spring.datasource.username`: Your MySQL username
      - `spring.datasource.password`: Your MySQL password

3. **Clone & Run:**
   - Clone the repository:
      ```bash
      git clone [https://github.com/krishnapilato/portfolio.git](https://github.com/krishnapilato/portfolio.git)
      ```

   - Navigate to the backend directory:
      ```bash
      cd backend/java
      ```

   - Start the Spring Boot application:
      ```bash
      ./mvnw spring-boot:run
      ```

Now your backend API is alive and well at `http://localhost:8080/`! 🎉

## 🛠️ Technologies Used

- **Java:** Our reliable workhorse for the backend logic.
- **Spring Boot:** The superhero framework that makes building Java web applications a breeze.
- **Spring Security:** The guardian of your API, keeping it safe with authentication and authorization.
- **Spring Data JPA:** Simplifies database interactions with a touch of magic.
- **Hibernate:** The bridge between your Java objects and the MySQL database.
- **JWT (JSON Web Tokens):** The secret handshake for secure user authentication.

## 💡 Need Help?

If you run into any issues or have questions, don't hesitate to reach out! You can create an issue on GitHub, or find me on LinkedIn/Twitter.

Happy coding!  ✨
