export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',

  website: {
    header: {
      title: 'khovakrishnapilato.com',
      style: {
        color: '#000',
        fontFamily: 'Arial, sans-serif',
      },
      titleTooltip: 'Home',
      icons: [
        {
          icon: 'fa-solid fa-sliders',
          tooltip: 'Settings',
          link: '/dashboard',
          color: '#000000',
          hoverColor: '#0056b3',
          size: '20px',
          isActive: false,
          disabled: false,
        },
        {
          icon: 'fa-solid fa-address-card',
          tooltip: 'Profile',
          link: '/profile',
          color: '#000000',
          size: '20px',
          isActive: false,
          disabled: false,
          isLogoutMenuTrigger: true,
        },
        {
          icon: 'fa-brands fa-github',
          tooltip: 'GitHub',
          link: 'https://github.com/krishnapilato/portfolio/tree/dev/frontend/angular',
          color: '#000000',
          size: '20px',
          isActive: false,
          disabled: false,
        },
        {
          icon: 'fa-regular fa-paper-plane',
          tooltip: 'Contact',
          link: '/contact',
          color: '#000000',
          size: '20px',
          isActive: false,
          disabled: false,
        },
      ],
    },

    footer: {
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
      name: 'Khova Krishna Pilato',
      subtitle: 'Java Full Stack developer from',
      location: {
        country: 'Italy',
        province: 'Milan',
        city: 'Milan',
        address: 'XXXXXXXXXXXXXXXX',
        postalCode: '00122',
      },
      mainMessage: 'Lasting impact on the digital landscape with Python.',
      primaryAction: {
        text: 'See my projects',
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
