declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string;
    select_by: string;
  }
  interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
    native_callback?: (response: CredentialResponse) => void;
    ux_mode?: string;
  }
  function initialize(config: IdConfiguration): void;
  function prompt(oneTapConfig?: { cancel_on_tap_outside?: boolean }): void;
  function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
  interface GsiButtonConfiguration {
    type?: string;
    theme?: string;
    size?: string;
    text?: string;
    shape?: string;
    logo_alignment?: string;
    width?: number;
    locale?: string;
  }
}

interface Window {
  google?: {
    accounts: {
      id: typeof google.accounts.id;
    };
  };
}
