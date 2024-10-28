// #5F5E79 for undraw

export const environment = {
  production: false,
  apiUrl: 'https://backend-portfolio-v1-411a08a68df2.herokuapp.com',

  website: {
    backgroundColor: '#f0f4f7',
    fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
    header: {
      title: 'khovakrishna.pilato',
      fontFamily: '"Roboto", Arial, sans-serif',
      icons: [
        {
          matIcon: 'build',
          tooltip: 'Skills',
          link: '/dashboard',
          color: 'text-secondary',
        },
        {
          matIcon: 'person',
          tooltip: 'About Me',
          link: '/profile',
          color: 'text-primary',
        },
        {
          matIcon: 'email',
          tooltip: 'Contact',
          link: '/contact',
          color: 'text-success',
        },
        {
          matIcon: 'logout',
          tooltip: 'Logout',
          link: '/logout',
          color: 'text-danger',
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
