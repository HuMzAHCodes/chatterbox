'use client';

import * as Dialog from '@radix-ui/react-dialog';

export default function Modal({ open, onOpenChange, title, description, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 z-50 w-full max-w-md mx-4">
          {/* ANIMATION: scale in/fade */}

          <Dialog.Close className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Dialog.Close>

          <Dialog.Title className="text-lg font-semibold font-ui text-neutral-900 mb-1">
            {title}
          </Dialog.Title>

          {description && (
            <Dialog.Description className="text-sm font-ui text-neutral-600 mb-4">
              {description}
            </Dialog.Description>
          )}

          <div className="font-body text-neutral-900">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


// hello
