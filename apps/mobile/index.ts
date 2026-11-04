import { registerGlobals } from '@livekit/react-native';
import { registerRootComponent } from 'expo';

import App from './App';

// Initialize LiveKit WebRTC before starting the app
registerGlobals();

// Start Expo application
registerRootComponent(App);
