export const environment = {
  // General settings
  production: false,
  version: '1.0.0',
  appName: 'Portfolio App',
  apiUrl: 'https://backend-portfolio-v1-411a08a68df2.herokuapp.com',
  contactEmail: 'khovakrishna.pilato@gmail.com',
  phoneNumber: '+39 123 456 7890',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it'],
  googleAnalyticsId: 'UA-XXXXXXXXX-X',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',
  socialMedia: {
    linkedIn: 'https://www.linkedin.com/in/khovakrishnapilato',
    github: 'https://github.com/krishnapilato',
    twitter: 'https://twitter.com/khovakrishna',
    email: 'mailto:khovakrishna.pilato@gmail.com',
  },

  // Theming
  theme: {
    primaryColor: '#3a86ff',
    secondaryColor: '#5390d9',
    accentColor: '#ff006e',
    fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
    backgroundColor: '#f0f4f7',
    textColor: '#333333',
    footerBackgroundColor: '#e3e9ee',
    borderRadius: '8px',
    buttonStyles: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
    },
  },

  // Header Configuration
  header: {
    title: 'Khova Krishna Pilato',
    fontFamily: '"Roboto", Arial, sans-serif',
    logo: {
      url: '/assets/logo.png',
      alt: 'Portfolio Logo',
    },
    links: [
      {
        icon: 'fa-solid fa-wrench',
        tooltip: 'Skills',
        route: '#skills-page',
        color: 'text-secondary',
        external: false,
      },
      {
        icon: 'fa-regular fa-face-smile',
        tooltip: 'About Me',
        route: '/profile',
        color: 'text-primary',
        external: false,
      },
      {
        icon: 'fa-envelope',
        tooltip: 'Contact',
        route: '/contact',
        color: 'text-success',
        external: false,
      },
      {
        icon: 'fa-sign-out-alt',
        tooltip: 'Logout',
        route: '/logout',
        color: 'text-danger',
        external: false,
      },
      {
        icon: 'fa-linkedin',
        tooltip: 'LinkedIn',
        route: 'https://www.linkedin.com/in/khovakrishnapilato',
        color: 'text-primary',
        external: true,
      },
    ],
    actions: [
      {
        label: 'Login',
        route: '/auth/login',
        class: 'btn btn-primary',
      },
      {
        label: 'Register',
        route: '/auth/signup',
        class: 'btn btn-outline-primary',
      },
    ],
  },

  // Footer Configuration
  footer: {
    name: 'Khova Krishna Pilato',
    text: `© ${new Date().getFullYear()} Khova Krishna Pilato • All rights reserved`,
    style: { color: '#000', fontSize: '11px Arial' },
    links: [
      { label: 'Privacy Policy', route: '/privacy-policy' },
      { label: 'Terms of Service', route: '/terms-of-service' },
      { label: 'Contact', route: '/contact' },
    ],
    socialLinks: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/khovakrishnapilato',
        icon: 'fa-linkedin',
      },
      {
        label: 'GitHub',
        href: 'https://github.com/krishnapilato',
        icon: 'fa-github',
      },
      {
        label: 'Twitter',
        href: 'https://twitter.com/khovakrishna',
        icon: 'fa-twitter',
      },
    ],
  },

  // Home Section Configuration
  home: {
    title: 'Hi, I am Krishna',
    subtitle: 'Java Full Stack Developer based in Milan, Italy',
    description: 'I am a passionate Java Full Stack Developer based in Northern Italy, dedicated to creating applications that enhance user experiences.',
    skills: [
      'Java',
      'Spring Boot',
      'Angular',
      'AWS',
      'Database',
      'JavaScript',
      'Python',
      'TypeScript',
      'HTML/CSS',
      'React',
      'Node.js',
      'Express',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Docker',
      'Jenkins',
      'Git',
      'RESTful services',
      'JUnit',
      'Scrum',
      'Microservices architecture',
      'Kubernetes',
      'CI/CD',
      'GraphQL',
    ],
    portfolioProjects: [
      {
        name: 'E-Commerce Platform',
        description: 'A full-stack e-commerce web application.',
        technologies: ['Angular', 'Spring Boot', 'PostgreSQL'],
        link: 'https://github.com/krishnapilato/e-commerce',
        image: '/assets/projects/e-commerce.png',
      },
      {
        name: 'Task Management System',
        description: 'A task manager for agile teams.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        link: 'https://github.com/krishnapilato/task-manager',
        image: '/assets/projects/task-manager.png',
      },
    ],
    actions: [
      {
        text: 'LinkedIn',
        link: 'https://www.linkedin.com/in/khovakrishnapilato',
      },
      {
        text: 'Resume',
        link: 'https://drive.google.com/download/resume',
      },
    ],
    contactForm: {
      fields: [
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          placeholder: 'Enter your name',
          validationMessage:
            'Name is required and should only contain letters.',
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
          validationMessage: 'Please enter a valid email address.',
        },
        {
          id: 'message',
          label: 'Message',
          type: 'textarea',
          placeholder: 'Write your message here',
          validationMessage:
            'Message is required and should be at least 10 characters long.',
        },
      ],
      submitButton: {
        text: 'Send Message',
        class: 'btn btn-primary',
      },
    },
  },
};