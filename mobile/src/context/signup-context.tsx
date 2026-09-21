import React, { createContext, useContext, useState } from 'react';
import { useAvatarPicker, type AvatarPickerState } from '@/hooks/use-avatar-picker';
import { useDocumentPicker, type DocumentPickerState } from '@/hooks/use-document-picker';
import type { SignUpPayload } from '@/services/auth.service';

type SignupDraft = Omit<SignUpPayload, 'password'>;

interface SignupContextValue {
  draft: SignupDraft | null;
  setDraft: (draft: SignupDraft | null) => void;
  photo: AvatarPickerState;
  idDocument: DocumentPickerState;
  clear: () => void;
}

const SignupContext = createContext<SignupContextValue | null>(null);

/** Only lives inside the auth stack. Files and form fields never enter route URLs. */
export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<SignupDraft | null>(null);
  const photo = useAvatarPicker();
  const idDocument = useDocumentPicker();

  return (
    <SignupContext.Provider
      value={{
        draft,
        setDraft,
        photo,
        idDocument,
        clear: () => {
          setDraft(null);
          photo.reset();
          idDocument.reset();
        },
      }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (!context) throw new Error('useSignup must be used within SignupProvider');
  return context;
}
