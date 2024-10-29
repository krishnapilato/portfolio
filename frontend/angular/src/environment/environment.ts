export const environment = {
  production: false,
  apiUrl: 'https://backend-portfolio-v1-411a08a68df2.herokuapp.com',

  theme: {
    primaryColor: '#3a86ff',
    secondaryColor: '#5390d9',
    fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
    backgroundColor: '#f0f4f7',
    footerBackgroundColor: '#e3e9ee',
  },

  header: {
    title: 'khovakrishna.pilato',
    fontFamily: '"Roboto", Arial, sans-serif',
    links: [
      {
        icon: 'build',
        tooltip: 'Skills',
        route: '/dashboard',
        color: 'text-secondary',
      },
      {
        icon: 'person',
        tooltip: 'About Me',
        route: '/profile',
        color: 'text-primary',
      },
      {
        icon: 'email',
        tooltip: 'Contact',
        route: '/contact',
        color: 'text-success',
      },
      {
        icon: 'logout',
        tooltip: 'Logout',
        route: '/logout',
        color: 'text-danger',
      },
    ],
  },

  footer: {
    name: 'Khova Krishna Pilato',
    text: `© ${new Date().getFullYear()} Khova Krishna Pilato • All rights reserved`,
    style: { color: '#000', fontSize: '11px Arial' },
    year: '2024'
  },

  home: {
    title: 'Hi, I am Krishna',
    subtitle: 'Java Full Stack Developer based in Milan, Italy',
    description:
      'Passionate about backend development, cloud services, and impactful applications.',
    actions: [
      {
        text: 'Discover more about me',
        link: '#about-me',
        color: '#FFFFFF',
        customClass: 'skills-button',
      },
      {
        text: 'Download resume',
        link: 'https://drive.google.com',
        color: '#007BFF',
        customClass: 'download-button',
      },
    ],
    
    contactForm: {
      fields: [
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          placeholder: 'Enter your name',
          validationMessage: 'Name is required and should only contain letters.',
        },
        {
          id: 'surname',
          label: 'Surname',
          type: 'text',
          placeholder: 'Enter your surname',
          validationMessage:
            'Surname is required and should only contain letters.',
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
    },
    socialLinks: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/khovakrishnapilato',
        btnStyle: {
          colorClass: 'btn-outline-primary',
          textColor: '#0077b5',
          icon: 'fa-linkedin',
        },
      },
      {
        label: 'GitHub',
        href: 'https://github.com/krishnapilato',
        btnStyle: {
          colorClass: 'btn-outline-dark',
          textColor: '#333',
          icon: 'fa-github',
        },
      },
      {
        label: 'Email',
        href: 'mailto:youremail@example.com',
        btnStyle: {
          colorClass: 'btn-outline-secondary',
          textColor: '#6c757d',
          icon: 'fa-envelope',
        },
      },

    ],
  },
};