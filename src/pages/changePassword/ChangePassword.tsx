import { Button, PageWrapper } from "@src/components/common";
import {
  topbarContainer,
  topbarIcon,
  topbarText,
} from "../settings/style/style";
import { ICON_SIZE } from "@src/constants/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiChevronLeft } from "react-icons/fi";
import { object, ref, string } from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PasswordInput } from "@src/components/accountForm/PasswordInput";
import { useState } from "react";
import { RiKey2Fill } from "react-icons/ri";
import { messageAPI } from "@src/messageAPI/api";
import { useLoading, useToast } from "@src/hooks";

const schema = object().shape({
  currentPassword: string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "password_requirements_error" // acount_form.password_requirements_error
    )
    .required(),
  newPassword: string().required("New password is required"),
  confirmPassword: string().oneOf(
    [ref("newPassword")],
    "confirm_password_requirements" // acount_form.confirm_password_requirements
  ),
});

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  understand: boolean;
}

export const ChangePassword = () => {
  const { t } = useTranslation("change_password");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading();

  const methods = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      understand: false,
    },
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, register, formState, watch, setValue } = methods;

  const resetPassword = async (data: ChangePasswordFormValues) => {
    starLoading();
    try {
      await messageAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      showSuccessToast(t("password_changed"));
      navigate(-1);
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
    endLoading();
  };

  const { ref: refCurrentPassword, ...registerCurrentPassword } =
    register("currentPassword");

  const { ref: refNewPassword, ...registerNewPassword } =
    register("newPassword");

  const { ref: refConfirmPassword, ...registerConfirmPassword } =
    register("confirmPassword");

  const isButtonDisabled = !formState.isValid || !watch("understand");

  return (
    <PageWrapper>
      <div className={topbarContainer}>
        <FiChevronLeft
          className={topbarIcon}
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className={topbarText}>{t("title")}</p>
      </div>
      <FormProvider {...methods}>
        <div className="flex-1 flex flex-col justify-star mb-4">
          <div className="flex flex-col gap-3 flex-1">
            <PasswordInput
              data-testid="current-password"
              isHidden={!showPassword}
              placeholder={t("current_password")}
              showIcon
              onToggleVisibility={() => setShowPassword(!showPassword)}
              innerRef={refCurrentPassword}
              leftIcon={<RiKey2Fill size={20} />}
              {...registerCurrentPassword}
            />
            <PasswordInput
              data-testid="new-password"
              isHidden={!showPassword}
              placeholder={t("new_password")}
              innerRef={refNewPassword}
              {...registerNewPassword}
            />
            <PasswordInput
              data-testid="confirm-password"
              isHidden={!showPassword}
              placeholder={t("confirm_password")}
              innerRef={refConfirmPassword}
              {...registerConfirmPassword}
            />
            <p>{t("password_tip")}</p>
            <div className="flex items-center gap-2">
              <input
                data-testid="understand-checkbox"
                id="checked-checkbox"
                type="checkbox"
                value=""
                checked={watch("understand")}
                onChange={({ target }) => {
                  setValue("understand", target.checked);
                }}
                className="w-3 h-3 bg-transparent border border-gray-300 rounded-sm checked:bg-[#12B28C] checked:border-[#12B28C]"
              />
              <label
                htmlFor="checked-checkbox"
                className="text-sm text-blue-500"
              >
                {t("yes_i_understand")}
              </label>
            </div>
          </div>
          <div className="mt-10">
            <Button
              data-testid="submit-button"
              isLoading={isLoading}
              isDisabled={isButtonDisabled}
              classname="w-full"
              onClick={handleSubmit(resetPassword)}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      </FormProvider>
    </PageWrapper>
  );
};
