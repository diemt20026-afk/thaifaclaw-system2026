import { FactoryProfile, IndustrialLaw, LawAlertNotification } from '../types/law';
import { playAlertSound } from './sound';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function isLawMatchedWithFactory(law: IndustrialLaw, factory: FactoryProfile): boolean {
  const criteria = law.applicableCriteria;
  if (!criteria) return true;

  // Domain-specific equipment & process matching:
  // Machinery & Boiler laws: only require boiler if law is specifically about boilers
  if (law.category === 'machinery' && criteria.hasBoiler && !factory.hasBoiler) {
    return false;
  }

  // Air emission & CEMS: matches if factory has air stack OR large boiler
  if (law.category === 'air_pollution') {
    if (!factory.hasAirEmissionStack && !factory.hasBoiler) {
      return false;
    }
  }

  // Wastewater: applies if factory has wastewater treatment or discharge
  if (law.category === 'wastewater' && !factory.hasWastewaterTreatment) {
    return false;
  }

  // Hazardous chemicals / PRTR: applies if factory uses or stores chemicals
  if (law.category === 'hazardous' && !factory.hasHazardousChemicals) {
    return false;
  }

  // General industrial waste (WMS), safety, license (รง.4), and fire protection apply to all factories!
  return true;
}

export function sendBrowserNotification(
  alert: LawAlertNotification,
  soundEnabled = true
) {
  if (soundEnabled) {
    playAlertSound(alert.urgency === 'critical' ? 'urgent' : 'info');
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`[เรดาร์กฎหมายโรงงาน] ${alert.title}`, {
        body: `${alert.message}\nแนวทางแก้ไข: ${alert.actionRequired}`,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}
