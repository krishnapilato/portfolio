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
        icon: 'fa-solid fa-wrench',
        tooltip: 'Skills',
        route: '/dashboard',
        color: 'text-secondary',
      },
      {
        icon: 'fa-regular fa-face-smile',
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
    year: '2024',
  },

  home: {
    title: 'Hi, I am Krishna',
    subtitle: 'Java Full Stack Developer based in Milan, Italy',
    description:
      'I am a passionate Java Full Stack Developer based in Northern Italy, dedicated to creating applications that enhance user experiences.',
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
    ],
    actions: [
      {
        text: 'LinkedIn',
        link: 'https://www.linkedin.com/in/khovakrishnapilato',
      },
      {
        text: 'Resume',
        link: 'https://drive.usercontent.google.com/download?id=1vXJCBHQ_ZofGUYmpVsuAr-i-gqcpjkaA&export=download&authuser=0&confirm=t&uuid=677fcf3c-7ffc-48b4-bec5-45b9fa74bff6&at=AN_67v06s10Z9DaeuerLsXcN7zb4:1730295103202',
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

  formData: {
    inputs: [
      {
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full name',
        formControlName: 'name',
        required: true,
      },
      {
        label: 'Date of Birth',
        type: 'date',
        placeholder: 'Select your date of birth',
        formControlName: 'dob',
        required: true,
      },
      {
        label: 'Old Password',
        type: 'password',
        placeholder: 'Enter your old password',
        formControlName: 'oldPassword',
        required: true,
      },
      {
        label: 'New Password',
        type: 'password',
        placeholder: 'Enter your new password',
        formControlName: 'newPassword',
        required: true,
      },
      {
        label: 'Confirm New Password',
        type: 'password',
        placeholder: 'Confirm your new password',
        formControlName: 'confirmPassword',
        required: true,
      },
    ],
    buttons: [
      {
        label: 'Save Changes',
        type: 'submit',
        class: 'btn btn-primary w-100',
      },
    ],
  },
};