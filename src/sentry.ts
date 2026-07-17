import * as Sentry from '@sentry/vue';
import type { Router } from 'vue-router';
import { EnvironmentAccessorService } from './common/services/enviroment-accessor.service';
import ServiceError from './common/utils/ServiceError';

function isParsableUrl(url: string): boolean {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parsePropagationTargets(targets: string): RegExp[] {
  const entries = targets
    .split(',')
    .map((target) => target.trim())
    .filter((target) => target.length > 0);
  const validUrls = entries.filter((url) => url.startsWith('https://') && isParsableUrl(url));
  const dropped = entries.filter((entry) => !validUrls.includes(entry));
  if (dropped.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`Ignoring invalid Sentry trace propagation targets (must be valid https:// URLs): ${dropped.join(', ')}`);
  }
  return validUrls
    .map((url) => escapeRegExp(new URL(url).origin))
    .map((origin) => new RegExp(`^${origin}(?:[/?#]|$)`));
}

export function captureError(error: unknown, context?: Record<string, string>): void {
  if (error instanceof ServiceError) {
    Sentry.captureException(error, {
      tags: {
        service: error.serviceName,
        method: error.triggeredByMethod,
        ...context,
      },
      extra: { technicalMessage: error.technicalMessage },
      fingerprint: [error.serviceName, error.triggeredByMethod],
    });
    return;
  }
  Sentry.captureException(error, { tags: context });
}

export function getSentryOptions(router: Router): Parameters<typeof Sentry.init>[0] {
  const {
    sentryDsn, sentryEnv, sentryTracePropagationTargets,
  } = EnvironmentAccessorService.getEnvironmentVariables();
  const tracePropagationTargets = parsePropagationTargets(sentryTracePropagationTargets);
  return {
    dsn: sentryDsn,
    environment: sentryEnv,
    ...(tracePropagationTargets.length > 0 ? { tracePropagationTargets } : {}),
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
      Sentry.browserTracingIntegration({
        router,
        traceFetch: true,
        traceXHR: true,
      }),
      Sentry.httpClientIntegration(),
      Sentry.replayIntegration({
        blockAllMedia: true,
      }),
    ],
    propagateTraceparent: true,
    enableLogs: true,
    tracesSampleRate: 0.5,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  };
}
