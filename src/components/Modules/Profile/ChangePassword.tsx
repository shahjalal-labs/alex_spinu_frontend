import { useChangePasswordMutation } from "@/redux/api/authApi";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-lg font-medium text-title">
      {children}
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  visible,
  toggleVisible,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  toggleVisible: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-white/10 bg-[#1a1d22] px-4 pr-12 text-base text-description outline-none transition-colors placeholder:text-description focus:border-primary"
      />
      <button
        type="button"
        onClick={toggleVisible}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-description transition-opacity hover:opacity-80"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function ChangePassword() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      }).unwrap();
      toast.success("Password updated successfully");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update password");
    }
  };
  return (
    <div className="space-y-3a bg-[#000000] p-4 md:p-8 rounded-xl">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold leading-none text-white">
            Change Password
          </h2>
          <Info size={18} className="text-description" />
        </div>
      </div>

      <div className="mt-6 w-full space-y-5">
        <div>
          <FieldLabel>Old Password</FieldLabel>
          <PasswordInput
            value={form.oldPassword}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, oldPassword: value }))
            }
            placeholder="Input your old password"
            visible={showOld}
            toggleVisible={() => setShowOld((prev) => !prev)}
          />
        </div>

        <div>
          <FieldLabel>New Password</FieldLabel>
          <PasswordInput
            value={form.newPassword}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, newPassword: value }))
            }
            placeholder="Input your new password"
            visible={showNew}
            toggleVisible={() => setShowNew((prev) => !prev)}
          />
          <p className="mt-2 text-sm text-description">
            Min 8 Characters with a combination of letters and numbers
          </p>
        </div>

        <div>
          <FieldLabel>Confirmation New Password</FieldLabel>
          <PasswordInput
            value={form.confirmPassword}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, confirmPassword: value }))
            }
            placeholder="Confirm your new password"
            visible={showConfirm}
            toggleVisible={() => setShowConfirm((prev) => !prev)}
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="h-12 min-w-[120px] rounded-lg bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-8 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
