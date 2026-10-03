import { useState, useEffect, useCallback } from 'react';
import { PageRoute, HomepageMode } from '../types';
import { initialPartyDetails } from '../data/partyData';

/**
 * Determine the automatic homepage based on current date vs event date.
 * Event date: 2026-10-03 (Saturday, October 3, 2026)
 */
export function getAutoHomepage(targetDateIso: string = initialPartyDetails.dateIso): PageRoute {
  try {
    const now = new Date();
    const eventDate = new Date(targetDateIso);

    // Event Day Start: 00:00:00 of October 3, 2026
    const eventDayStart = new Date(eventDate);
    eventDayStart.setHours(0, 0, 0, 0);

    // Event Day End: 23:59:59 of October 3, 2026
    const eventDayEnd = new Date(eventDate);
    eventDayEnd.setHours(23, 59, 59, 999);

    if (now < eventDayStart) {
      return 'before';
    } else if (now <= eventDayEnd) {
      return 'during';
    } else {
      return 'after';
    }
  } catch {
    return 'before';
  }
}

/**
 * Parses the current route from:
 * 1. URL search params: ?page=during | ?view=after | ?page=before | ...
 * 2. URL hash: #/during | #/after | #/before
 * 3. URL pathname: /during | /after | /before | /pre
 * 4. Fallback to homepageMode (or auto-calculated if mode is 'auto')
 */
export function getCurrentRoute(homepageMode: HomepageMode = 'during'): PageRoute {
  if (typeof window === 'undefined') return 'during';

  // 1. Check Search Parameters
  const params = new URLSearchParams(window.location.search);
  const paramVal = (params.get('page') || params.get('view') || params.get('tab') || '').toLowerCase();
  if (paramVal === 'upload') return 'upload';
  if (paramVal === 'during') return 'during';
  if (paramVal === 'after') return 'after';
  if (paramVal === 'before' || paramVal === 'pre') return 'before';

  // 2. Check Hash
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().split('?')[0];
  if (hash === 'upload') return 'upload';
  if (hash === 'during') return 'during';
  if (hash === 'after') return 'after';
  if (hash === 'before' || hash === 'pre') return 'before';

  // 3. Check Pathname
  const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');
  if (pathname.endsWith('/upload')) return 'upload';
  if (pathname.endsWith('/during')) return 'during';
  if (pathname.endsWith('/after')) return 'after';
  if (pathname.endsWith('/before') || pathname.endsWith('/pre')) return 'before';

  // 4. Default Root ("/") Homepage resolution
  if (homepageMode === 'auto') {
    return getAutoHomepage(initialPartyDetails.dateIso);
  }

  if (homepageMode === 'pre') return 'before';

  return homepageMode;
}

/**
 * Programmatic client-side navigation that keeps URL clean
 * and updates state without full page refresh.
 */
export function navigateTo(target: PageRoute | string) {
  if (typeof window === 'undefined') return;

  let nextUrl = '/';
  if (target === 'upload' || target === '/upload') {
    nextUrl = '/upload';
  } else if (target === 'during' || target === '/during') {
    nextUrl = '/during';
  } else if (target === 'after' || target === '/after') {
    nextUrl = '/after';
  } else if (target === 'before' || target === '/before' || target === 'pre' || target === '/pre') {
    nextUrl = '/before';
  } else if (typeof target === 'string') {
    nextUrl = target;
  }

  // Push state if different
  if (window.location.pathname !== nextUrl) {
    window.history.pushState({}, '', nextUrl);
  }

  // Dispatch popstate event so all useCurrentRoute hooks sync
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Hook to read and subscribe to the active route.
 */
export function useCurrentRoute(homepageMode: HomepageMode = 'during') {
  const [route, setRoute] = useState<PageRoute>(() => getCurrentRoute(homepageMode));

  const refreshRoute = useCallback(() => {
    setRoute(getCurrentRoute(homepageMode));
  }, [homepageMode]);

  useEffect(() => {
    refreshRoute();

    window.addEventListener('popstate', refreshRoute);
    window.addEventListener('hashchange', refreshRoute);

    return () => {
      window.removeEventListener('popstate', refreshRoute);
      window.removeEventListener('hashchange', refreshRoute);
    };
  }, [homepageMode, refreshRoute]);

  return {
    route,
    navigate: navigateTo,
    effectiveHomepage: homepageMode === 'auto' ? getAutoHomepage() : homepageMode
  };
}
