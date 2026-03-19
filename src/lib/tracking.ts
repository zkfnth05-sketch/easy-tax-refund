import { db } from './firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

export interface TrackingData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
  timestamp: number;
}

const TRACKING_COOKIE_NAME = 'etr_marketing_tracking';

/**
 * Parses URL parameters and stores them in localStorage for later attribution.
 */
export function captureTrackingData(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  
  // Check if there are any UTM parameters
  const hasUtm = ['utm_source', 'utm_medium', 'utm_campaign'].some(param => urlParams.has(param));
  
  if (hasUtm) {
    const trackingData: TrackingData = {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
      landingPage: window.location.pathname,
      referrer: document.referrer || undefined,
      timestamp: Date.now(),
    };

    localStorage.setItem(TRACKING_COOKIE_NAME, JSON.stringify(trackingData));
  }
}

/**
 * Retrieves the stored tracking data from localStorage.
 */
export function getStoredTrackingData(): TrackingData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(TRACKING_COOKIE_NAME);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error recovering tracking data:', error);
    return null;
  }
}

/**
 * Clears the stored tracking data (e.g., after successful attribution).
 */
export function clearTrackingData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRACKING_COOKIE_NAME);
}

/**
 * Logs a visit to Firestore daily_stats collection.
 * Uses sessionStorage to prevent multiple logs in the same session.
 */
export async function logVisit(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionKey = 'etr_visit_logged';
    if (sessionStorage.getItem(sessionKey)) return;

    const today = new Date().toISOString().split('T')[0];
    const statRef = doc(db, 'daily_stats', today);
    
    // Get stored tracking data to attribute the visit
    const trackingData = getStoredTrackingData();
    const rawSource = trackingData?.utmSource || 'direct';
    // Ensure the source name is safe for Firestore field paths (replace dots, etc.)
    const safeSource = rawSource.replace(/\./g, '_');

    await setDoc(statRef, { 
      visitCount: increment(1),
      [`sourceVisits.${safeSource}`]: increment(1)
    }, { merge: true });
    
    sessionStorage.setItem(sessionKey, 'true');
  } catch (error) {
    console.error('Error logging visit:', error);
  }
}
