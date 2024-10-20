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
        backgroundColor:
          'radial-gradient(circle, rgba(255,241,247,1) 100%, rgba(174,185,214,1) 100%, rgba(197,207,218,1) 100%);',
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
          link: 'contact',
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
      actions: {
        primaryAction: {
          text: 'Discover more about me >',
          style: {
            color: '#FFFFFF',
            customClass: 'skills-button',
          },
        },
        secondaryAction: {
          externalLink: 'https://drive.google.com',
          text: 'Download resume',
          style: {
            color: '#007BFF',
            customClass: 'download-button',
          },
        },
      },
      image: 'developer.svg',
      skills: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
      carrrierTitle: 'My Career',
      carrrierSubtitle: '(Working with a lot of techs)',
      socialLinks: {
        linkedin: 'https://www.linkedin.com/in/khovakrishnapilato',
        github: 'https://github.com/krishnapilato',
      },
    },
  },
};
