import { object, ref, string } from "yup";

export const passwordValidationScheme = object({
  password: string().required(),
  confirmPassword: string()
    .oneOf(
      [ref("password")],
      "confirm_password_requirements" // acount_form.confirm_password_requirements
    )
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "password_requirements_error" // acount_form.password_requirements_error
    )
    .required(),
});

export const emptyValidation = object();
