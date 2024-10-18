// #5F5E79 for undraw

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',

  website: {
    backgroundColor: '#f0f4f7',
    fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
    header: {
      title: 'khovakrishnapilato.com',
      style: {
        backgroundColor: '#e3e9ee',
        color: '#000',
        fontFamily: 'Arial, sans-serif',
      },
      titleTooltip: 'Home',
      icons: [
        {
          icon: 'fas fa-tools',
          tooltip: 'Skills & Experience',
          link: '/dashboard',
          color: '##6c757d',
          hoverColor: '#0056b3',
          size: '20px',
          isActive: true,
          disabled: false,
        },
        {
          icon: 'fas fa-user',
          tooltip: 'About Me',
          link: '/profile',
          color: '#007bff',
          size: '20px',
          isActive: false,
          disabled: false,
          isLogoutMenuTrigger: true,
        },
        {
          icon: 'fas fa-envelope',
          tooltip: 'Contact',
          link: 'https://github.com/krishnapilato/portfolio/tree/dev/frontend/angular',
          color: '#28a745',
          size: '20px',
          isActive: false,
          disabled: false,
        },
        {
          icon: 'fas fa-sign-out-alt',
          tooltip: 'Logout',
          link: '/logout',
          color: '#dc3545',
          size: '20px',
          isActive: false,
          disabled: false,
        },
      ],
    },

    footer: {
      backgroundColor: '#e3e9ee',
      year: new Date().getFullYear().toString(),
      owner: {
        name: 'Khova Krishna Pilato',
        message: 'All rights reserved',
      },
      style: {
        color: '#000000',
        font: '11px Arial',
      },
      showYear: true,
    },

    home: {
      name: 'Krishna',
      subtitle: 'Full Stack developer from',
      location: {
        country: 'Italy',
        province: 'Milan',
        city: 'Milan',
        address: 'XXXXXXXXXXXXXXXX',
        postalCode: '00122',
      },
      mainMessage: 'Working with ',
      primaryAction: {
        text: 'View My Skills',
        style: {
          color: '#00FF00',
          icon: 'fa-regular fa-eye',
        },
        tooltip: 'View my work',
      },
      secondaryAction: {
        text: 'Download resume',
        style: {
          color: '#007BFF',
          icon: 'fa-solid fa-download',
        },
        tooltip: 'Download resume',
      },
      skills: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
      skillsDisplay: {
        type: '', // 'typed' || 'chips'
        typedSettings: {
          cursorChar: '_',
          typeSpeed: 300,
          backSpeed: 300,
          backDelay: 1500,
          loop: true,
          showCursor: true,
        },
        chipSettings: {
          chipColor: '#2196F3',
          chipFontSize: '14px',
        },
      },
      socialLinks: {
        linkedin: 'https://www.linkedin.com/in/khovakrishnapilato',
        github: 'https://github.com/krishnapilato',
      },
    },
  },
};
