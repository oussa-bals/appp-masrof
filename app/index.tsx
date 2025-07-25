import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Redirect to splash screen
    router.replace('/splash');
  }, []);

  return null;
}