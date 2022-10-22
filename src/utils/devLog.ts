/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

export const devLog = (...args) => {
  if (
    !process.env.NODE_ENV ||
    process.env.NODE_ENV === 'development' ||
    window.location.hash.startsWith('#dev')
  ) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
