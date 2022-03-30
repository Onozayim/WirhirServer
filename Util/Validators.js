const validateRegisterInput = (
  userName,
  password,
  confirmPassword,
  email,
  lenguage
) => {
  const errors = {};

  if (lenguage === "español") {
    if (userName.trim() === "")
      errors.userName = "El nombre de usuario no debe de estar vacío";

    if (email.trim() === "") errors.email = "El correo no debe de estar vacio";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors.email = "El correo debe de ser valido";
      }
    }

    if (password === "")
      errors.passwordEmpty = "La contraseña no debe de estar vacía";
    else if (password.length < 8)
      errors.passwordTooShort = "La contraseña debe tener almenos 8 caracteres";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Las contraseñas no coinciden";
  } else {
    if (userName.trim() === "") errors.userName = "User name must not be empty";

    if (email.trim() === "") errors.email = "Email name must not be empty";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors.email = "Email must be a valid email address";
      }
    }

    if (password === "") errors.passwordEmpty = "Password must not be empty";
    else if (password.length < 8)
      errors.passwordTooShort = "Password must have 8 or more carachters";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

const validateLoginInput = (email, password, lenguage) => {
  const errors = {};

  if (lenguage === "español") {
    if (email.trim() === "") errors.email = "El correo no debe de estar vacio";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors.email = "Correo no valido";
      }
    }

    if (password === "")
      errors.passwordEmpty = "La contraseña no debe de estar vacía";
  } else {
    if (email.trim() === "") errors.email = "Email name must not be empty";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors.email = "Email must be a valid email address";
      }
    }

    if (password === "") errors.passwordEmpty = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

const validateEmail = (email, lenguage) => {
  if (lenguage === "español") {
    if (email.trim() === "") return "El correo no debe de estar vacio";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        return "correo no valido";
      }
    }
  } else {
    if (email.trim() === "") return "Email name must not be empty";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        return "Email not valid";
      }
    }
  }

  return null;
};

const validateRecoverPassword = (
  email,
  lenguage,
  password,
  confirmPassword
) => {
  if (lenguage === "español") {
    if (email.trim() === "") return "El Correo no debe de estar vacio";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        return "El correo no es valido";
      }
    }

    if (password === "") return "La contraseña no debe de estar vacía";
    else if (password.length < 8)
      return "Las contreseñas deben tener mas de 8 caracteres";
    else if (password !== confirmPassword)
      return "Las contraseñas no coinciden";
  } else {
    if (email.trim() === "") return "Email name must not be empty";
    else {
      const regEx =
        /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        return "Email must be a valid email address";
      }
    }

    if (password === "") return "Password must not be empty";
    else if (password.length < 8)
      return "Password must have 8 or more carachters";
    else if (password !== confirmPassword) return "Passwords must match";
  }

  return null;
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateEmail,
  validateRecoverPassword,
};
