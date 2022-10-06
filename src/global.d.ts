declare module "*.scss" {
  const styles: any;
  export = styles;
}

/**
 * Include `null` to T
 */
type Nullable<T> = T | null;

/**
 * Augmented declaration of environment variables
 */
declare namespace NodeJS {
  interface ProcessEnv {
    package: any;
  }
}
