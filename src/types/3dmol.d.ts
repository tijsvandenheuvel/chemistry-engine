declare module "3dmol" {
  export interface GLViewer {
    addModel(data: string, format: string): void;
    removeAllModels(): void;
    setStyle(selection: unknown, style: unknown): void;
    zoomTo(): void;
    render(): void;
    spin(flag?: boolean): void;
    clear(): void;
    setBackgroundColor(color: string | number, alpha?: number): void;
  }

  export interface ThreeDmolModule {
    createViewer(element: HTMLElement, options?: Record<string, unknown>): GLViewer;
  }

  export const createViewer: ThreeDmolModule["createViewer"];
  const defaultExport: ThreeDmolModule;
  export default defaultExport;
}
