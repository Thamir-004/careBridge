import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SignIn } from '@clerk/clerk-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <SignIn
          routing="virtual"
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#3b82f6',
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;