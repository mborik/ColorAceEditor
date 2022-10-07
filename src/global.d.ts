declare module '*.scss' {
  const styles: any;
  export = styles;
}

/**
 * Include `null` to T
 */
type Nullable<T> = T | null;
/**
 * Optional T
 */
type Optional<T> = T | undefined;

/**
 * Augmented declaration of environment variables
 */
declare namespace NodeJS {
  interface ProcessEnv {
    package: any;
  }
}
