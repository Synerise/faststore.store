export type MenuCategoriesItem = {
  /** Texto exibido no menu */
  text: string;
  /** URL do link */
  link: string;
};

export type MenuCategoriesSectionProps = {
  /** Cor de fundo do menu (ex: #ffffff) */
  backgroundColor: string;
  /** Cor do texto dos itens (ex: #444444) */
  textColor: string;
  /** Itens do menu (Texto + Link), cadastrados no CMS */
  menu: MenuCategoriesItem[];
};
