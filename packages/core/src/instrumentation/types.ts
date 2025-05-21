import { Tracer, Meter } from '@opentelemetry/api';

// Placeholder for any specific types we might need later
/**
 * Interface representing configuration options for instrumentation.
 * @typedef {Object} InstrumentationConfig
 * @property {string} [serviceName] - The name of the service.
 * @property {string} [otlpEndpoint] - The endpoint for OpenTelemetry Protocol (OTLP).
 * @property {boolean} [enabled] - Flag to indicate if instrumentation is enabled.
 */
export interface InstrumentationConfig {
  serviceName?: string;
  otlpEndpoint?: string;
  enabled?: boolean;
}

/**
 * Interface for an instrumentation service that provides access to tracers, meters, and allows for flushing and stopping.
 * @interface
 */
export interface IInstrumentationService {
  readonly name: string;
  readonly capabilityDescription: string;
  instrumentationConfig: InstrumentationConfig;
  isEnabled(): boolean;
  getTracer(name?: string, version?: string): Tracer | null;
  getMeter(name?: string, version?: string): Meter | null;
  flush(): Promise<void>;
  stop(): Promise<void>;
}
