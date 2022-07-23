export const validateObjectProperties = (
  someObject: any,
  allowedProperties: string[]
): boolean => {
  const objectProperties: string[] = Object.keys(someObject);
  const isValid: boolean = objectProperties.every((property) =>
    allowedProperties.includes(property)
  );
  return isValid;
};

export const isSecurePassword = (password: string): boolean => {
  const mediumRegex: RegExp = new RegExp(
    "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})"
  );
  if (!password.match(mediumRegex)) {
    return false;
  }
  return true;
};

export const isCorrectEmail = (email: string): boolean => {
  if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
    return false;
  }
  return true;
};
