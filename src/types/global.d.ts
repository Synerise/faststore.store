type GenericObject = Record<string, any>;
interface Window {
  SyneriseTC?: any;
  SR: {
    event: {
      itemSearchClick: (
        args: Record<string, unknown>
      ) => Record<string, unknown>;
      recommendationView: (
        args: Record<string, unknown>
      ) => Record<string, unknown>;
      sendFormData?: (tag: string, data: Record<string, unknown>) => void;
    };
  };
}