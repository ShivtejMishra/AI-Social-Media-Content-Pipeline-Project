import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuthStore } from '../../store/authStore';

const ProductTour = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    // Only run if the user hasn't seen the tour yet
    const hasSeenTour = localStorage.getItem(`tour_completed_${user?._id}`);
    
    // Slight delay to let the dashboard render
    const timer = setTimeout(() => {
      if (!hasSeenTour) {
        const driverObj = driver({
          showProgress: true,
          animate: true,
          steps: [
            {
              element: '#tour-welcome',
              popover: {
                title: 'Welcome to SocialX Studio! 🎉',
                description: 'Let\'s take a quick tour of your new AI content pipeline.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#tour-workspaces',
              popover: {
                title: 'Workspaces',
                description: 'Organize your brands, clients, or projects here. Each workspace acts as a separate content silo.',
                side: 'right',
                align: 'start'
              }
            },
            {
              element: '#tour-generate',
              popover: {
                title: 'AI Generation',
                description: 'Click here to instantly generate captions, threads, and high-quality images tailored to your brand.',
                side: 'right',
                align: 'start'
              }
            },
            {
              element: '#tour-calendar',
              popover: {
                title: 'Content Calendar',
                description: 'Visualize your entire content schedule across all platforms at a glance.',
                side: 'right',
                align: 'start'
              }
            },
            {
              element: '#tour-analytics',
              popover: {
                title: 'Insights',
                description: 'Track your content velocity and AI generation limits here.',
                side: 'right',
                align: 'start'
              }
            }
          ],
          onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || confirm('Are you sure you want to skip the tour?')) {
              localStorage.setItem(`tour_completed_${user?._id}`, 'true');
              driverObj.destroy();
            }
          },
        });

        driverObj.drive();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  return null;
};

export default ProductTour;
