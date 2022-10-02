declare module "*.scss" {
  const styles: any;
  export = styles;
}

/**
 * Include `null` to T
 */
type Nullable<T> = T | null;
