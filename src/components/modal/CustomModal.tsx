"use client";

interface ModalAction {
  label: string;
  onClick: (data?: any) => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: ModalAction[];
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-4xl",
  full: "max-w-full",
};
export const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  actions = [],
  title,
  maxWidth = "2xl",
  showCloseButton = true,
  closeOnOutsideClick = true,
}) => {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 "></div>

      <div
        className={`relative bg-[#242424] shadow-xl border border-primary/20 rounded-2xl w-full ${maxWidthClasses[maxWidth]} overflow-hidden max-h-[70vh] flex flex-col z-10`}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 pb-4 ">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {actions.length > 0 && (
          <div className="flex justify-center gap-3 p-6 pt-4 ">
            {actions.map((btn, i) => (
              <button
                key={i}
                onClick={() => btn.onClick()}
                className={`px-8 py-3 font-medium transition-colors rounded-2xl ${
                  btn.variant === "primary"
                    ? "bg-primary text-body hover:bg-primary/80 transition-colors"
                    : "border border-primary text-primary hover:bg-primary transition-colors duration-300 ease-in hover:text-body"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
