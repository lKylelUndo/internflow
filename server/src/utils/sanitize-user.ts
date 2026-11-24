export const sanitizeUser = <T extends { password: string }>(user: T): Omit<T, 'password'> => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};
